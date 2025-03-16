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

export default function Permissions() {
    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

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

    useEffect(() => {
        if (sendText === activeChat.permissions.sendText && sendMedia === activeChat.permissions.sendMedia && addUsers === activeChat.permissions.addUsers && pinMessages === activeChat.permissions.pinMessages)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [sendText, sendMedia, addUsers, pinMessages])

    const applyChanges = useCallback(() => {
        const permissions = {
            _id: activeChat._id,
            permissions: {
                sendText,
                sendMedia,
                addUsers,
                pinMessages
            }
        }
        socket.emit('UpdateGroupPermissions', { token: Auth.authJWT, ...permissions })
        socket.on('UpdateGroupPermissions', (response) => {
            if (response.ok) {
                socket.off('UpdateGroupPermissions')
                PageClose(dispatch, true)
            }
        })
    }, [sendText, sendMedia, addUsers, pinMessages])

    return <>
        <div className={"Permissions" + (!isLoaded ? ' fadeThrough' : '')}>
            <PageHeader key={sendText + sendMedia + addUsers + pinMessages + hasChanged}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Title"><span>Permissions</span></div>
                <div className="Meta">
                    <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
                </div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    <span className="title">What can members of this group do?</span>
                    <div className="Item"><span>Send Text Messages</span>
                        <Switch checked={sendText} setChecked={setSendText} />
                    </div>
                    <div className="Item"><span>Send Media</span>
                        <Switch checked={sendMedia} setChecked={setSendMedia} />
                    </div>
                    <div className="Item"><span>Add Users</span>
                        <Switch checked={addUsers} setChecked={setAddUsers} />
                    </div>
                    <div className="Item"><span>Pin Messages</span>
                        <Switch checked={pinMessages} setChecked={setPinMessages} />
                    </div>
                </div>
            </div>
        </div>
    </>
}