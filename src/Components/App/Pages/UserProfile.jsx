import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader } from "../Page";
import { BackArrow, Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Menu from "../../UI/Menu";
import { handleCall, handleContextMenu, handleGoToMessage, handleTopbarContentChange, handleTopBarFloating, handleUserProfile, setActiveChat } from "../../Stores/UI";
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
import { decimalToHex } from "../../Util/colors";
import CustomEmoji from "../Message/CustomEmoji";
import { imagedataToImage } from "../../Util/canvas";
import { clamp } from "../../Util/math";
import { handleCoolDown } from "../../Util/coolDown";


function UserProfile() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [fullUser, setFullUser] = useState()
    const [commonChats, setCommonChats] = useState()
    const [tabIndex, setTabIndex] = useState(0)
    const [media, setMedia] = useState([])
    const [GIFs, setGIFs] = useState([])
    const [profileColors, setProfileColors] = useState([])
    const [showInfoInTopBar, setShowInfoInTopBar] = useState(false)

    const dispatch = useDispatch()

    const User = useContext(UserContext)

    const page = useRef()
    const userRef = useRef()
    const gooeyRef = useRef()
    const profileButtonsRef = useRef()
    const userInfoRef = useRef()

    const userProfile = useSelector((state) => state.ui.userProfile)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)

    // TODO: Fix Design In Default Theme

    useEffect(() => {
        if (userProfile.id.value === User.id.value) {
            PageHandle(dispatch, 'Settings', 'Settings')
            return;
        } else
            setIsLoaded(true);

        dispatch(handleTopBarFloating({ floating: !!userProfile.profileColor?.color, absolute: true }));

        (async () => {
            const getProfileColors = await client.invoke(new Api.help.GetPeerProfileColors({}))

            const bgColors = userProfile.profileColor?.color && getProfileColors.colors[userProfile.profileColor.color + 1].colors.bgColors

            setProfileColors(bgColors)

            console.log('profileColors', getProfileColors, bgColors)

            setFullUser(((await client.invoke(new Api.users.GetFullUser({ id: userProfile.id }))).fullUser))

            // Get Media Messages
            const getMedia = await client.getMessages(userProfile.id, {
                limit: 100,
                filter: Api.InputMessagesFilterPhotoVideo,
            })

            // setMedia(getMedia)

            const getGIFs = await client.getMessages(userProfile.id, {
                limit: 100,
                filter: Api.InputMessagesFilterGif,
            })

            // setGIFs(getGIFs)

            setCommonChats((await client.invoke(new Api.messages.GetCommonChats({
                userId: userProfile.id
            }))).chats)
        })()

        return () => dispatch(handleTopBarFloating({ floating: false, absolute: false }));
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

    const handleBackgroundEmojisAnimation = useCallback((anim, canvas) => {
        const ctx = canvas.getContext('2d')

        const MIN_SIZE = 18;
        const MIDDLE_SIZE = 20;
        const MAX_SIZE = 24;
        const MIN_OPACITY = .16;
        const MIDDLE_OPACITY = .2;

        const canvasWidth = 375
        const canvasHeight = 180

        const positions = [
            [307, 155, MIN_SIZE, MIN_OPACITY],
            [68, 155, MIN_SIZE, MIN_OPACITY],
            [317, 95, MIN_SIZE, MIN_OPACITY],
            [58, 95, MIN_SIZE, MIN_OPACITY],
            [292, 52, MIN_SIZE, MIN_OPACITY],
            [83, 52, MIN_SIZE, MIN_OPACITY],
            [213, 195, MIN_SIZE, MIDDLE_OPACITY],
            [162, 195, MIN_SIZE, MIDDLE_OPACITY],
            [273, 204, MIN_SIZE, MIN_OPACITY],
            [102, 204, MIN_SIZE, MIN_OPACITY],
            [253, 163, MIDDLE_SIZE, MIDDLE_OPACITY],
            [120, 163, MIDDLE_SIZE, MIDDLE_OPACITY],
            [258, 75, MIN_SIZE, MIDDLE_OPACITY],
            [117, 75, MIN_SIZE, MIDDLE_OPACITY],
            [269, 113, MAX_SIZE, MIDDLE_OPACITY],
            [100, 113, MAX_SIZE, MIDDLE_OPACITY],
            [230, 44, MIDDLE_SIZE, MIDDLE_OPACITY],
            [143, 44, MIDDLE_SIZE, MIDDLE_OPACITY],
            [187.5, 34, MIN_SIZE, MIDDLE_OPACITY]
        ]

        const dpr = canvas.dpr = window.devicePixelRatio;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;

        const frame = anim.frameQueue.queue[0]?.frame
        anim.imageData.data.set(frame);

        const image = imagedataToImage(anim.imageData)
        image.onload = (() => {
            positions.forEach(([x, y, size, alpha]) => {
                ctx.globalAlpha = alpha;
                ctx.drawImage(image, x * dpr, y * dpr, size * dpr, size * dpr)
            })

            ctx.globalAlpha = 1;

            page.current.addEventListener('scroll', () => {
                const scrollTop = page.current.scrollTop
                const minScroll = 0;

                if (scrollTop < minScroll) return

                const centerX = canvasWidth / 2
                const centerY = canvasHeight / 2

                ctx.clearRect(0, 0, canvas.width, canvas.height)

                var distanceFromCenterX = 0;
                var distanceFromCenterY = 0;
                var addedX = 0;
                var addedY = 0;

                positions.forEach(([x, y, size, alpha]) => {

                    distanceFromCenterX = centerX - x;
                    distanceFromCenterY = centerY - y;

                    // if (Math.abs(distanceFromCenterX) < scrollTop * 4) {
                    //     addedX = (distanceFromCenterX) * ((scrollTop - minScroll) / (120 - minScroll)) * 2
                    //     addedY = distanceFromCenterY * ((scrollTop - minScroll) / (120 - minScroll)) * 2
                    // } else {
                    //     addedX = 0
                    //     addedY = 0
                    // }

                    let distance = Math.sqrt(distanceFromCenterX ** 2 + distanceFromCenterY ** 2);

                    let startScroll = distance / 4;

                    let progress = (scrollTop - startScroll) / (120 - minScroll);
                    progress = Math.max(0, Math.min(1, progress * 4));

                    addedX = distanceFromCenterX * progress;
                    addedY = distanceFromCenterY * progress;

                    ctx.globalAlpha = alpha * (1 - progress);
                    ctx.drawImage(image, (x + addedX) * dpr, (y + addedY) * dpr, size * dpr, size * dpr)
                })
            })
        })
    }, [])

    const handleScrollEffects = useCallback(() => {
        const scrollTop = page.current.scrollTop

        const blurClamp = clamp(scrollTop, 30, 120)
        const blurValue = (blurClamp - 30) / 90

        const scaleClamp = Math.max(scrollTop, 0)

        const gooeyClamp = Math.min(scrollTop / 54, 1)

        const infoMin = 0
        const infoMax = 108
        const infoClamp = clamp(scrollTop, infoMin, infoMax)
        const infoSize = (infoClamp - infoMin) / (infoMax - infoMin)

        userRef.current.querySelector('.profile').style.filter = `blur(${blurValue * 10}px)`
        userRef.current.querySelector('.profile').style.transform = `scale(${1 - (scaleClamp - 0) / 148})`
        userRef.current.querySelector('.profile').style.setProperty('--opacity', blurValue * 2)
        userRef.current.querySelector('.profile').style.marginBottom = `-${((scaleClamp - 0) / 120) * 48}px`

        gooeyRef.current.style.opacity = gooeyClamp

        // if (scrollTop > infoMax)
        //     document.querySelector('.LeftColumn .TopBar').appendChild(userInfoRef.current)
        // else {
        //     userRef.current.appendChild(userInfoRef.current)
        // }

        // if (scrollTop >= infoMax) {
        //     userInfoRef.current.style = `position: fixed;top:8px;`
        //     userRef.current.style.height = '120px'
        // } else {
        //     userInfoRef.current.style = ''
        //     userRef.current.style.height = ''
        // }
        userInfoRef.current.querySelector('.name').style.fontSize = (1 - infoSize) * 12 + 16 + 'px'
        userInfoRef.current.querySelector('.subtitle').style.fontSize = (1 - infoSize) * 6 + 12 + 'px'

        const buttonsMin = infoMax
        const buttonsMax = 170
        const buttonsClamp = clamp(scrollTop, buttonsMin, buttonsMax)
        const buttonsHeight = buttonsMax - buttonsClamp

        profileButtonsRef.current.style.height = buttonsHeight + 'px'
        profileButtonsRef.current.style.marginTop = buttonsClamp - buttonsMin + 'px'
        profileButtonsRef.current.style.opacity = buttonsHeight / 62
        profileButtonsRef.current.style.setProperty('--value', buttonsHeight / 62)

        if (scrollTop > 110) {
            userInfoRef.current.style.visibility = 'hidden'
            setShowInfoInTopBar(true)
        } else {
            userInfoRef.current.style.visibility = ''
            setShowInfoInTopBar(false)
        }

        if (scrollTop > 175) {
            dispatch(handleTopBarFloating({ floating: false, absolute: true }))
        } else
            dispatch(handleTopBarFloating({ floating: !!userProfile.profileColor?.color, absolute: true }))

        // handleCoolDown(handleScrollDebounce, 150)
    }, [])

    const handleScrollDebounce = () => {
        const scrollTop = page.current.scrollTop

        if (scrollTop < 40) {
            page.current.scrollTop = 0
        } else if (scrollTop < 113) {
            page.current.scrollTop = 112
        }
    }

    return <div className={"UserProfile" + (!isLoaded ? ' fadeThrough' : '')} ref={page} onScroll={handleScrollEffects} onTouchEnd={handleScrollDebounce}>
        <PageHeader force={showInfoInTopBar}>
            <div><BackArrow index={1} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
            <div className="Content">
                {showInfoInTopBar && <div className="FlexColumn">
                    <div className="title">
                        <FullNameTitle chat={userProfile} isSavedMessages={userProfile.id.value === User.id.value} />
                    </div>
                    <div className="subtitle">
                        {userInfoSubtitle()}
                    </div>
                </div>}
            </div>
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
            <div className={buildClassName("ProfileSection", profileColors && 'hasBackground')} style={{ background: profileColors && `radial-gradient(${decimalToHex(profileColors[1])}, ${decimalToHex(profileColors[0])})` }}>
                {userProfile?.profileColor?.backgroundEmojiId && <div className="BackgroundEmojis">
                    <CustomEmoji onLoad={handleBackgroundEmojisAnimation} returnData documentId={userProfile.profileColor?.backgroundEmojiId?.value} autoPlay={false} />
                </div>}
                <div className="User" ref={userRef}>
                    <div className="GooeyEffect">
                        <div className="gooey" ref={gooeyRef}></div>
                        <Profile showPreview entity={userProfile} name={userProfile.firstName} id={userProfile.id.value} />
                        <svg>
                            <defs>
                                <filter id="gooey">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="filter" />
                                    <feComposite in="SourceGraphic" in2="filter" operator="atop" />
                                </filter>
                            </defs>
                        </svg>
                    </div>
                    <div ref={userInfoRef} className="FlexColumn" style={{ width: '100%' }}>
                        <div className="name"><FullNameTitle chat={userProfile} isSavedMessages={userProfile.id.value === User.id.value} /></div>
                        <div className="subtitle">{userInfoSubtitle()}</div>
                    </div>
                    {!iOSTheme &&
                        <div className="StartChat" onClick={privateMessage}>
                            <Icon name="chat" />
                        </div>}
                </div>
                {iOSTheme && <>
                    <div className="Buttons" ref={profileButtonsRef}>
                        <div className="Button" onClick={privateMessage}>
                            <Icon name="chat" />
                            <div className="title">
                                Message
                            </div>
                        </div>
                        <div className="Button" onClick={privateMessage}>
                            <Icon name="notifications" />
                            <div className="title">
                                Mute
                            </div>
                        </div>
                        <div className="Button">
                            <Icon name="call" />
                            <div className="title">
                                Call
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
            </div>
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
                            <MediaItem key={item.id} messageId={item.id} chat={userProfile} dispatch={dispatch}>
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
                {commonChats?.length > 0 && <TabContent state={true}>
                    <div className="Items">
                        {renderCommonChats()}
                    </div>
                </TabContent>}
            </Tabs>
        </div>
        <ContextMenu type="media" />
    </div>
    {/* <Transition state={ui.subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */ }
}

export default memo(UserProfile)

export const showUserProfile = (user, dispatch) => {
    dispatch(handleUserProfile(user))
    PageHandle(dispatch, 'UserProfile', '')
}

export const MediaItem = memo(({ children, messageId, chat, dispatch }) => {
    const element = useRef()

    const onContextMenu = e =>
        mediaMenu(e, element.current, messageId, chat, dispatch)

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

    return <Image
        media={media}
        visible={true}
        size={16}
        _width={50}
        _height={50}
        noAvatar={true}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
        setProgress={() => { }} />
})

export const MediaVideo = memo(({ media }) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const videoAttributes = getDocumentVideoAttributes(media.document)

    return <Video
        media={media}
        visible={true}
        details={{
            duration: videoAttributes?.duration,
            size: Number(media.document.size?.value)
        }}
        size={16} width={50} height={50} noAvatar={true}
        isLoaded={isLoaded}
        setIsLoaded={setIsLoaded}
        setProgress={() => { }}
        autoplay={false} />
})

const mediaMenu = (e, element, messageId, chat, dispatch) => {
    e.preventDefault()

    const onShowInChat = () => {
        viewChat(generateChatWithPeer(chat), dispatch)
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