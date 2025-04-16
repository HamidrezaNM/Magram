import { memo, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader, SubPage } from "../Page";
import { BackArrow, Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Transition from "../Transition";
import { ChatContext } from "../ChatContext";
import Menu from "../../UI/Menu";
import { handleCall, handlePage, handleTopbarTitleChange, handleUserProfile, setActiveChat } from "../../Stores/UI";
import FullNameTitle from "../../common/FullNameTitle";
import { getUserStatus } from "../MiddleColumn/ChatInfo";
import { client } from "../../../App";
import { Api } from "telegram";
import { generateChatWithPeer, getChatSubtitle } from "../../Helpers/chats";
import { viewChat } from "../ChatList";


function UserProfile() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [fullUser, setFullUser] = useState()
    const [commonChats, setCommonChats] = useState()

    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Chat = useContext(ChatContext)

    const page = useRef()

    const userProfile = useSelector((state) => state.ui.userProfile)
    const centerTopBar = useSelector((state) => state.ui.customTheme.centerTopBar)

    useEffect(() => {
        if (userProfile.id.value === User.id.value) {
            PageHandle(dispatch, 'Settings', 'Settings')
            return;
        } else
            setIsLoaded(true);
        (async () => {
            setFullUser(((await client.invoke(new Api.users.GetFullUser({ id: userProfile.id }))).fullUser))

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
    }, [])

    const renderCommonChats = () => {

        return <>
            {commonChats?.length > 0 && commonChats.map((item) => (
                <div key={item.id?.value} className="Item" onClick={() => { viewChat(generateChatWithPeer(item), dispatch); PageClose(dispatch) }}>
                    <Profile entity={item} size={44} name={item?.title} id={item.id?.value} />
                    <div className="UserDetails">
                        <div className="title">{item?.title ?? item.firstName}</div>
                        <div className="subtitle">{getChatSubtitle(item)}</div>
                    </div>
                </div>
            ))}
        </>
    }

    return <>
        <div className={"UserProfile" + (!isLoaded ? ' fadeThrough' : '')} ref={page}>
            <PageHeader>
                <div><BackArrow index={0} onClick={() => PageClose(dispatch)} isiOS={centerTopBar} /></div>
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
                    <div className="FlexColumn">
                        <div className="name"><FullNameTitle chat={userProfile} isSavedMessages={userProfile.id.value === User.id.value} /></div>
                        <div className="subtitle" style={{ fontSize: 14 }}>{userInfoSubtitle()}</div>
                    </div>
                    <div className="StartChat" onClick={privateMessage}><Icon name="chat" /></div>
                </div>
                <div className="Items">
                    {userProfile.phone && <div className="Item"><Icon name="phone" /><span>+{userProfile.countryCode} {userProfile.phone}</span></div>}
                    {userProfile.username && <div className="Item"><Icon name="alternate_email" /><span>{userProfile.username}</span></div>}
                    {fullUser?.about && <div className="Item preWrap"><Icon name="info" /><span>{fullUser.about}</span></div>}
                </div>
            </div>
            <div className="section TabSection">
                <div className="Tabs">
                    <div className="Tab active"><span>Groups</span></div>
                    <div className="Tab"><span>Media</span></div>
                </div>
                <div className="Items">
                    {renderCommonChats()}
                </div>
            </div>
        </div>
        {/* <Transition state={ui.subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */}
    </>
}

export default memo(UserProfile)

export const showUserProfile = (user, dispatch) => {
    dispatch(handleUserProfile(user))
    PageHandle(dispatch, 'UserProfile', '')
}