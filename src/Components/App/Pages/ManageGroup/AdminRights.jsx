import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHeader } from "../../Page";
import { BackArrow, Profile, Switch } from "../../common";
import { showUserProfile } from "../UserProfile";
import { getUserStatus } from "../../MiddleColumn/ChatInfo";
import { client } from "../../../../App";
import { Api } from "telegram";
import { updateChatParticipantAdmin } from "../../../Stores/Chats";

export default function AdminRights() {
    const dispatch = useDispatch()

    const subPage = useSelector((state) => state.ui.subPage)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const data = subPage[2]?.data ?? subPage[3]?.data

    const rights = data.participant.adminRights

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [changeGroupInfo, setChangeGroupInfo] = useState(rights?.changeInfo ?? true)
    const [deleteMessages, setDeleteMessages] = useState(rights?.deleteMessages ?? true)
    const [banUsers, setBanUsers] = useState(rights?.banUsers ?? true)
    const [pinMessages, setPinMessages] = useState(rights?.pinMessages ?? true)
    const [addNewAdmins, setAddNewAdmins] = useState(rights?.addAdmins ?? false)
    const [anonymous, setAnonymous] = useState(rights?.anonymous ?? false)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (changeGroupInfo === rights?.changeInfo &&
            deleteMessages === rights?.deleteMessages &&
            banUsers === rights?.banUsers &&
            pinMessages === rights?.pinMessages &&
            addNewAdmins === rights?.addAdmins &&
            anonymous === rights?.anonymous)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [changeGroupInfo, deleteMessages, banUsers, pinMessages, addNewAdmins, anonymous])

    const applyChanges = useCallback(async () => {
        const permissions = new Api.ChatAdminRights({
            changeInfo: changeGroupInfo,
            deleteMessages,
            banUsers,
            pinMessages,
            addAdmins: addNewAdmins,
            anonymous
        })

        const result = await client.invoke(new Api.channels.EditAdmin({
            channel: activeChat.id,
            userId: data.id,
            adminRights: permissions,
            rank: ''
        }))

        console.log(result)
        dispatch(updateChatParticipantAdmin({
            id: Number(activeChat.id),
            userId: Number(data.id),
            adminRights: permissions
        }))
        PageClose(dispatch, true)
    }, [changeGroupInfo, deleteMessages, banUsers, pinMessages, addNewAdmins, anonymous])

    return <div className={"AdminRights" + (!isLoaded ? ' fadeThrough' : '')}>
        <PageHeader key={changeGroupInfo + deleteMessages + banUsers + pinMessages + addNewAdmins + anonymous + hasChanged}>
            <div><BackArrow index={4} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
            <div className="Title"><span>Admin Rights</span></div>
            <div className="Meta">
                <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
            </div>
        </PageHeader>
        <div className="section">
            <div className="Items">
                <div className="Item" onClick={() => showUserProfile(data, dispatch)}>
                    <Profile size={44} entity={data} name={data?.firstName} id={data?.id} />
                    <div className="UserDetails">
                        <div className="title">{data?.firstName}</div>
                        <div className="subtitle">{getUserStatus(data.status, data)}</div>
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
                <div className="Item"><span>Remain Anonymous</span>
                    <Switch checked={anonymous} setChecked={setAnonymous} />
                </div>
            </div>
        </div>
    </div>
}