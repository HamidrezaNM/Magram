import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../../Auth/Auth";
import { PageClose, PageHandle, PageHeader, SubPage } from "../Page";
import { Icon, Profile } from "../common";
import DropdownMenu from "../../UI/DropdownMenu";
import MenuItem from "../../UI/MenuItem";
import Transition from "../Transition";
import { ChatContext } from "../ChatContext";
import Menu from "../../UI/Menu";
import { handleCall, handlePage, handleTopbarTitleChange, handleUserProfile, setActiveChat } from "../../Stores/UI";
import FullNameTitle from "../../common/FullNameTitle";
import { getUserStatus } from "../MiddleColumn/ChatInfo";


export default function UserProfile() {
    const [isLoaded, setIsLoaded] = useState(false)

    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Chat = useContext(ChatContext)

    const page = useRef()

    const userProfile = useSelector((state) => state.ui.value.userProfile)

    useEffect(() => {
        if (userProfile.id.value === User.id.value) {
            PageHandle(dispatch, 'Settings', 'Settings')
            return;
        } else
            setIsLoaded(true)
    }, [])

    const userInfoSubtitle = () => {
        if (userProfile.bot) return 'bot'
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

    return <>
        <div className={"UserProfile" + (!isLoaded ? ' fadeThrough' : '')} ref={page}>
            <PageHeader>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch)} /></div>
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
                    {userProfile.bio && <div className="Item"><Icon name="info" /><span>{userProfile.bio}</span></div>}
                </div>
            </div>
            <div className="section">
                <div className="Tabs">
                    <div className="Tab active"><span>Media</span></div>
                </div>
                <div className="Items">

                </div>
            </div>
        </div>
        {/* <Transition state={ui.subPage[0]}><SubPage>{getSubPageLayout()}</SubPage></Transition> */}
    </>
}

export const showUserProfile = (user, dispatch) => {
    dispatch(handleUserProfile(user))
    PageHandle(dispatch, 'UserProfile', '')
}