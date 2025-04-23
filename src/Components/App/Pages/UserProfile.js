import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader } from "../Page";
import { BackArrow, Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Menu from "../../UI/Menu";
import { handleCall, handleContextMenu, handleGoToMessage, handleUserProfile, setActiveChat } from "../../Stores/UI";
import FullNameTitle from "../../common/FullNameTitle";
import { getUserStatus } from "../MiddleColumn/ChatInfo";
import { client } from "../../../App";
import { Api } from "telegram";
import { generateChatWithPeer, getChatSubtitle } from "../../Helpers/chats";
import { viewChat } from "../ChatList";
import buildClassName from "../../Util/buildClassName";
import Tabs from "../../UI/Tabs";
import TabContent from "../../UI/TabContent";
import { Image, Video } from "../Message/MessageMedia";
import { getDocumentFileName, getDocumentVideoAttributes, isDocumentVideo } from "../../Helpers/messages";
import ContextMenu from "../MiddleColumn/ContextMenu";


function UserProfile() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [fullUser, setFullUser] = useState()
    const [commonChats, setCommonChats] = useState()
    const [tabIndex, setTabIndex] = useState(0)
    const [media, setMedia] = useState([])
    const [GIFs, setGIFs] = useState([])

    const dispatch = useDispatch()

    const User = useContext(UserContext)

    const page = useRef()

    const userProfile = useSelector((state) => state.ui.userProfile)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)


    useEffect(() => {
        if (userProfile.id.value === User.id.value) {
            PageHandle(dispatch, 'Settings', 'Settings')
            return;
        } else
            setIsLoaded(true);
        (async () => {
            setFullUser(((await client.invoke(new Api.users.GetFullUser({ id: userProfile.id }))).fullUser))

            // Get Media Messages
            const getMedia = await client.getMessages(userProfile.id, {
                limit: 100,
                filter: Api.InputMessagesFilterPhotoVideo,
            })

            setMedia(getMedia)

            const getGIFs = await client.getMessages(userProfile.id, {
                limit: 100,
                filter: Api.InputMessagesFilterGif,
            })

            setGIFs(getGIFs)

            setCommonChats((await client.invoke(new Api.messages.GetCommonChats({
                userId: userProfile.id
            }))).chats)
        })()
    }, [])

    const userInfoSubtitle = () => {
        if (userProfile.bot) return userProfile.botActiveUsers ? userProfile.botActiveUsers + ' monthly users' : 'bot'
        if (userProfile.id.value == 777000) return 'Service notifications'
        return getUserStatus(userProfile.status, null, false)
    }

    // const getSubPageLayout = useCallback(() => {
    //     switch (ui.subPage[0]?.page) {
    //         default:
    //             break;
    //     }
    // }, [ui.subPage])

    const privateMessage = useCallback(() => {
        dispatch(setActiveChat({
            id: userProfile.id,
            entity: userProfile,
            message: null,
            title: userProfile.firstName,
            date: 0,
            isChannel: false,
            isGroup: false,
            isUser: true
        }))
        PageClose(dispatch)
    }, [])

    const renderCommonChats = () => {

        return commonChats?.length > 0 && commonChats.map((item) => (
            <div key={item.id?.value} className="Item" onClick={() => { viewChat(generateChatWithPeer(item), dispatch); PageClose(dispatch) }}>
                <Profile entity={item} size={44} name={item?.title} id={item.id?.value} />
                <div className="UserDetails">
                    <div className="title">{item?.title ?? item.firstName}</div>
                    <div className="subtitle">{getChatSubtitle(item)}</div>
                </div>
            </div>
        ))
    }

    const renderMedia = (media) => {
        switch (media.className) {
            case 'MessageMediaPhoto':
                return <MediaImage media={media} />
            case 'MessageMediaDocument':
                if (isDocumentVideo(media.document)) {
                    return <MediaVideo media={media} dispatch={dispatch} />
                }
        }
    }

    return <>
        <div className={"UserProfile" + (!isLoaded ? ' fadeThrough' : '')} ref={page}>
            <PageHeader>
                <div><BackArrow index={1} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
                <div className="Title"><span></span></div>
                <div className="Meta">
                    <Icon name="call" onClick={() => dispatch(handleCall(userProfile))} />
                    <Menu icon="more_vert">
                        <DropdownMenu className="top right withoutTitle">
                            <MenuItem icon="edit" title="Edit Contact" onClick={() => { }} />
                            <MenuItem icon="delete" title="Delete Contact" onClick={() => { }} />
                            <MenuItem icon="block" title="Block User" className="danger" onClick={() => { }} />
                        </DropdownMenu>
                    </Menu>
                </div>
            </PageHeader>
            <div className="section Info">
                <div className="User">
                    <Profile entity={userProfile} name={userProfile.firstName} id={userProfile.id.value} />
                    <div className="FlexColumn" style={{ width: '100%' }}>
                        <div className="name"><FullNameTitle chat={userProfile} isSavedMessages={userProfile.id.value === User.id.value} /></div>
                        <div className="subtitle" style={{ fontSize: 14 }}>{userInfoSubtitle()}</div>
                    </div>
                    {!iOSTheme &&
                        <div className="StartChat" onClick={privateMessage}>
                            <Icon name="chat" />
                        </div>}
                </div>
                {iOSTheme && <>
                    <div className="Buttons">
                        <div className="Button">
                            <Icon name="call" />
                            <div className="title">
                                Call
                            </div>
                        </div>
                        <div className="Button" onClick={privateMessage}>
                            <Icon name="chat" />
                            <div className="title">
                                Message
                            </div>
                        </div>
                        <div className="Button">
                            <Icon name="more_horiz" />
                            <div className="title">
                                More
                            </div>
                        </div>
                    </div>
                </>}
                <div className="Items">
                    {userProfile.phone && <div className="Item"><Icon name="phone" /><span>+{userProfile.countryCode} {userProfile.phone}</span></div>}
                    {userProfile.username && <div className="Item"><Icon name="alternate_email" /><span>{userProfile.username}</span></div>}
                    {fullUser?.about && <div className="Item preWrap"><Icon name="info" /><span>{fullUser.about}</span></div>}
                </div>
            </div>
            <div className="section TabSection">
                <Tabs index={tabIndex} setIndex={setTabIndex} showOneTab tabs={
                    <>
                        {media?.length > 0 && <div
                            className={buildClassName("Tab", tabIndex === 0 && 'active')}
                            onClick={() => setTabIndex(0)}>
                            <span>Media</span>
                        </div>}
                        {GIFs?.length > 0 && <div
                            className={buildClassName("Tab", tabIndex === 1 && 'active')}
                            onClick={() => setTabIndex(1)}>
                            <span>GIFs</span>
                        </div>}
                        {commonChats?.length > 0 && <div
                            className={buildClassName("Tab", tabIndex === 2 && 'active')}
                            onClick={() => setTabIndex(2)}>
                            <span>Groups</span>
                        </div>}
                    </>
                }>
                    {media?.length > 0 && <TabContent state={true}>
                        <div className="Items Media">
                            {media && media.map(item =>
                                <MediaItem key={item.id} messageId={item.id} dispatch={dispatch}>
                                    {renderMedia(item.media)}
                                </MediaItem>
                            )}
                        </div>
                    </TabContent>}
                    {GIFs?.length > 0 && <TabContent state={true}>
                        <div className="Items Media">
                            {GIFs && GIFs.map(item =>
                                <MediaItem key={item.id} messageId={item.id} dispatch={dispatch}>
                                    <MediaVideo media={item.media} />
                                </MediaItem>
                            )}
                        </div>
                    </TabContent>}
                    {commonChats?.length && <TabContent state={true}>
                        <div className="Items">
                            {renderCommonChats()}
                        </div>
                    </TabContent>}
                </Tabs>
            </div>
            <ContextMenu type="media" />
        </div>
        {/* <Transition state={ui.subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */}
    </>
}

export default memo(UserProfile)

export const showUserProfile = (user, dispatch) => {
    dispatch(handleUserProfile(user))
    PageHandle(dispatch, 'UserProfile', '')
}

export const MediaItem = memo(({ children, messageId, dispatch }) => {
    const element = useRef()

    const onContextMenu = e =>
        mediaMenu(e, element.current, messageId, dispatch)

    useEffect(() => {
        element.current.removeEventListener('contextmenu', onContextMenu)
        element.current.addEventListener('contextmenu', onContextMenu)
    }, [])

    return <div ref={element} className="MediaItem">
        {children}
    </div>
})

export const MediaImage = memo(({ media }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    return <Image media={media} size={16} _width={50} _height={50} noAvatar={true} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={() => { }} />
})

export const MediaVideo = memo(({ media }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const videoAttributes = getDocumentVideoAttributes(media.document)

    return <Video media={media} details={{ name: getDocumentFileName(media.document), duration: videoAttributes?.duration, size: Number(media.document.size?.value) }} size={16} width={50} height={50} noAvatar={true} isLoaded={isLoaded} setIsLoaded={setIsLoaded} setProgress={() => { }} autoplay={false} />
})

const mediaMenu = (e, element, messageId, dispatch) => {
    e.preventDefault()

    const onShowInChat = () => {
        dispatch(handleGoToMessage(messageId))
        dispatch(handleContextMenu())
        PageClose(dispatch)
    }

    const items = (
        <>
            <MenuItem icon="chat" title="Show in chat" onClick={onShowInChat} />
        </>
    )

    dispatch(handleContextMenu({ items, type: 'media', e, activeElement: element }))
}