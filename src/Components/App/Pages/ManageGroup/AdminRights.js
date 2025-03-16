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
import { getChatData } from "../../Chat";

export default function AdminRights() {
    const dispatch = useDispatch()
    const User = useContext(UserContext)
    const Auth = useContext(AuthContext)

    const subPage = useSelector((state) => state.ui.value.subPage)
    const activeChat = useSelector((state) => state.ui.value.activeChat)

    const data = subPage[2]?.data ?? subPage[3]?.data

    const userPermissions = activeChat.members[activeChat.members.indexOf(data)]?.permissions

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [changeGroupInfo, setChangeGroupInfo] = useState(userPermissions?.changeGroupInfo ?? true)
    const [deleteMessages, setDeleteMessages] = useState(userPermissions?.deleteMessages ?? true)
    const [banUsers, setBanUsers] = useState(userPermissions?.banUsers ?? true)
    const [pinMessages, setPinMessages] = useState(userPermissions?.pinMessages ?? true)
    const [addNewAdmins, setAddNewAdmins] = useState(userPermissions?.addNewAdmins ?? false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (changeGroupInfo === userPermissions?.changeGroupInfo && deleteMessages === userPermissions?.deleteMessages && banUsers === userPermissions?.banUsers && pinMessages === userPermissions?.pinMessages && addNewAdmins === userPermissions?.addNewAdmins)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [changeGroupInfo, deleteMessages, banUsers, pinMessages, addNewAdmins])

    const applyChanges = useCallback(() => {
        const permissions = {
            _id: activeChat._id,
            memberId: data._id,
            permissions: {
                changeGroupInfo,
                deleteMessages,
                banUsers,
                pinMessages,
                addNewAdmins
            }
        }
        socket.emit('UpdateMemberAdminRights', { token: Auth.authJWT, ...permissions })
        socket.on('UpdateMemberAdminRights', (response) => {
            if (response.ok) {
                socket.off('UpdateMemberAdminRights')
                PageClose(dispatch, true)
            }
        })
    }, [changeGroupInfo, deleteMessages, banUsers, pinMessages, addNewAdmins])

    return <>
        <div className={"AdminRights" + (!isLoaded ? ' fadeThrough' : '')}>
            <PageHeader key={changeGroupInfo + deleteMessages + banUsers + pinMessages + addNewAdmins + hasChanged}>
                <div><Icon name="arrow_back" className="backBtn" onClick={() => PageClose(dispatch, true)} /></div>
                <div className="Title"><span>Admin Rights</span></div>
                <div className="Meta">
                    <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
                </div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    <div className="Item" onClick={() => showUserProfile(data, dispatch)}>
                        <Profile size={44} name={data?.firstname} id={getChatData(data)?._id} />
                        <div className="UserDetails">
                            <div className="title">{data?.firstname}</div>
                            <div className="subtitle">Online</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="section">
                <div className="Items">
                    <span className="title">What can this admin do?</span>
                    <div className="Item"><span>Change Group Info</span>
                        <Switch checked={changeGroupInfo} setChecked={setChangeGroupInfo} />
                    </div>
                    <div className="Item"><span>Delete Messages</span>
                        <Switch checked={deleteMessages} setChecked={setDeleteMessages} />
                    </div>
                    <div className="Item"><span>Ban Users</span>
                        <Switch checked={banUsers} setChecked={setBanUsers} />
                    </div>
                    <div className="Item"><span>Pin Messages</span>
                        <Switch checked={pinMessages} setChecked={setPinMessages} />
                    </div>
                    <div className="Item"><span>Add New Admins</span>
                        <Switch checked={addNewAdmins} setChecked={setAddNewAdmins} />
                    </div>
                </div>
            </div>
        </div>
    </>
}