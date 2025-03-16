import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext, UserContext } from "../../../Auth/Auth";
import { ChatContext } from "../../ChatContext";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { Icon, Profile, Switch } from "../../common";
import { showUserProfile } from "../UserProfile";
import Transition from "../../Transition";
import { setChat } from "../../../Stores/Chats";
import { setActiveChat } from "../../../Stores/UI";
import { socket } from "../../../../App";
import AdminRights from "./AdminRights";

export default function Members() {
    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

    const subPage = useSelector((state) => state.ui.value.subPage)
    const activeChat = useSelector((state) => state.ui.value.activeChat)

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [sendText, setSendText] = useState(activeChat.permissions.sendText)
    const [sendMedia, setSendMedia] = useState(activeChat.permissions.sendMedia)
    const [addUsers, setAddUsers] = useState(activeChat.permissions.addUsers)
    const [pinMessages, setPinMessages] = useState(activeChat.permissions.pinMessages)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[3]?.page) {
            case 'AdminRights':
                return <AdminRights />
            default:
                break;
        }
    }, [subPage])

    const showAdminRights = (user, dispatch) => {
        // dispatch(handle(user))
        PageHandle(dispatch, 'AdminRights', 'Admin Rights', true, user)
    }

    return <>
        <div className={"Members" + (!isLoaded ? ' fadeThrough' : '') + (subPage[3] ? ' pushUp' : '')}>
            <PageHeader key={subPage[3]}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Title"><span>Members</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    {Object.values(activeChat.members).filter(member => { return member._id !== User._id }).map((item) => (
                        <div className="Item" onClick={() => showAdminRights(item, dispatch)}>
                            <Profile size={44} name={item.firstname} id={item._id} />
                            <div className="UserDetails">
                                <div className="title">{item.firstname}</div>
                                <div className="subtitle">Online</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <Transition state={subPage[3]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}