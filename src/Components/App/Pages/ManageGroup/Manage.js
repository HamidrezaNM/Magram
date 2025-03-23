import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext, UserContext } from "../../../Auth/Auth";
import { ChatContext } from "../../ChatContext";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { Icon, Profile } from "../../common";
import { showUserProfile } from "../UserProfile";
import Transition from "../../Transition";
import Permissions from "./Permissions";
import { socket } from "../../../../App";
import { setChat } from "../../../Stores/Chats";
import { setActiveChat } from "../../../Stores/UI";
import Administrators from "./Administrators";
import Members from "./Members";
import { getChatData } from "../../Chat";

export default function ManageGroup() {
    const dispatch = useDispatch()
    const Auth = useContext(AuthContext)

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [firstname, setFirstname] = useState(activeChat.firstname)
    const [username, setUsername] = useState(activeChat.username)
    const [bio, setBio] = useState(activeChat.bio)

    useEffect(() => {
        if (firstname === activeChat.firstname && username === activeChat.username && bio === activeChat.bio)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [firstname, username, bio])

    const applyChanges = useCallback(() => {
        const group = {
            _id: activeChat._id,
            firstname,
            username,
            bio,
            profile: []
        }
        socket.emit('UpdateGroup', { token: Auth.authJWT, ...group })
        socket.on('UpdateGroup', (response) => {
            if (response.ok) {
                dispatch(setChat(group))
                dispatch(setActiveChat({ ...activeChat, ...group }))
                socket.off('UpdateGroup')
                PageClose(dispatch, true)
            }
        })
    }, [firstname, username, bio])

    const getSubPageLayout = useCallback(() => {
        switch (subPage[1]?.page) {
            case 'Reactions':
                return <></>
            case 'Permissions':
                return <Permissions />
            case 'Administrators':
                return <Administrators />
            case 'Members':
                return <Members />
            default:
                break;
        }
    }, [subPage])

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    return <>
        <div className={"ManageGroup" + (!isLoaded ? ' fadeThrough' : '') + (subPage[1] ? ' pushUp' : '')}>
            <PageHeader key={subPage[1] + firstname + username + bio + hasChanged}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Title"><span>Manage</span></div>
                <div className="Meta">
                    <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
                </div>
            </PageHeader>
            <div className="section Info">
                <div className="User">
                    <Profile name={firstname} id={getChatData(activeChat)._id} />
                    <div className="textfield"><input type="text" value={firstname} onInput={(e) => setFirstname(e.target.value)} placeholder="Enter group name" /></div>
                </div>
                <div className="Items">
                    <div className="Item"><Icon name="alternate_email" /><div className="textfield"><input type="text" value={username} onInput={(e) => setUsername(e.target.value)} placeholder="Username (Optional)" /></div></div>
                    <div className="Item"><Icon name="info" /><div className="textfield"><input type="text" value={bio} onInput={(e) => setBio(e.target.value)} placeholder="Bio (Optional)" /></div></div>
                </div>
            </div>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Reactions', 'Reactions', true)}><Icon name="favorite" /><span>Reactions</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Permissions', 'Permissions', true)}><Icon name="key" /><span>Permissions</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Administrators', 'Administrators', true)}><Icon name="local_police" /><span>Administators</span></div>
                    <div className="Item" onClick={() => PageHandle(dispatch, 'Members', 'Members', true)}><Icon name="group" /><span>Members</span></div>
                </div>
            </div>
        </div>
        <Transition state={subPage[1]}><SubPage>{getSubPageLayout()}</SubPage></Transition>
    </>
}