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
import Members from "./Members";
import { getChatData } from "../../Chat";

export default function Administrators() {
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
        switch (subPage[2]?.page) {
            case 'AdminRights':
                return <AdminRights />
            case 'Members':
                return <Members />
            default:
                break;
        }
    }, [subPage])

    const showAdminRights = (user) => {
        PageHandle(dispatch, 'AdminRights', 'Admin Rights', true, user)
    }

    const showMembers = () => {
        PageHandle(dispatch, 'Members', 'Members', true)
    }

    return <>
        <div className={"Administrators" + (!isLoaded ? ' fadeThrough' : '') + (subPage[2] ? ' pushUp' : '')}>
            <PageHeader key={subPage[2]}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Title"><span>Administrators</span></div>
                <div className="Meta"></div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={showMembers}><Icon name="add_moderator" /><span>Add Admin</span></div>
                    {Object.values(activeChat.members).filter(item => { return item.admin === true }).map((item) => (
                        <div className="Item" onClick={() => showAdminRights(item)}>
                            <Profile size={44} name={item.firstname} id={getChatData(item)._id} />
                            <div className="UserDetails">
                                <div className="title">{item.firstname}</div>
                                <div className="subtitle">Online</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <Transition state={subPage[2]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}