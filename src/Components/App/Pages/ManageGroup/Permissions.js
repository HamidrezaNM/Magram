import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageClose, PageHandle, PageHeader, SubPage } from "../../Page";
import { BackArrow, Icon, Profile, Switch } from "../../common";
import { updateChatDefaultBannedRights } from "../../../Stores/Chats";
import { updateActiveChatDefaultBannedRights } from "../../../Stores/UI";
import { client } from "../../../../App";
import { Api } from "telegram";

export default function Permissions() {
    const dispatch = useDispatch()

    const activeChat = useSelector((state) => state.ui.activeChat)
    const centerTopBar = useSelector((state) => state.settings.customTheme.centerTopBar)

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasChanged, setHasChanged] = useState(false)
    const [sendPlain, setSendPlain] = useState(!activeChat.entity.defaultBannedRights?.sendPlain)
    const [sendMedia, setSendMedia] = useState(!activeChat.entity.defaultBannedRights?.sendMedia)
    const [inviteUsers, setInviteUsers] = useState(!activeChat.entity.defaultBannedRights?.inviteUsers)
    const [pinMessages, setPinMessages] = useState(!activeChat.entity.defaultBannedRights?.pinMessages)

    useEffect(() => {
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (sendPlain === !activeChat.entity.defaultBannedRights.sendPlain &&
            sendMedia === !activeChat.entity.defaultBannedRights.sendMedia &&
            inviteUsers === !activeChat.entity.defaultBannedRights.inviteUsers &&
            pinMessages === !activeChat.entity.defaultBannedRights.pinMessages)
            setHasChanged(false)
        else
            setHasChanged(true)
    }, [sendPlain, sendMedia, inviteUsers, pinMessages])

    const applyChanges = useCallback(async () => {
        const permissions = new Api.ChatBannedRights({
            sendPlain: !sendPlain,
            sendMedia: !sendMedia,
            inviteUsers: !inviteUsers,
            pinMessages: !pinMessages
        })

        const editChatDefaultBannedRights = await client.invoke(new Api.messages.EditChatDefaultBannedRights({
            peer: activeChat.entity.id,
            bannedRights: permissions
        }))

        dispatch(updateChatDefaultBannedRights({ id: activeChat.id.value, bannedRights: permissions }))
        dispatch(updateActiveChatDefaultBannedRights(permissions))

        PageClose(dispatch, true)
    }, [sendPlain, sendMedia, inviteUsers, pinMessages])

    return <>
        <div className={"Permissions" + (!isLoaded ? ' fadeThrough' : '')}>
            <PageHeader key={sendPlain + sendMedia + inviteUsers + pinMessages + hasChanged}>
                <div><BackArrow index={4} onClick={() => PageClose(dispatch, true)} isiOS={centerTopBar} /></div>
                <div className="Title"><span>Permissions</span></div>
                <div className="Meta">
                    <button className={hasChanged ? '' : 'disabled'} onClick={applyChanges}>Apply</button>
                </div>
            </PageHeader>
            <div className="section">
                <div className="Items">
                    <span className="title">What can members of this group do?</span>
                    <div className="Item"><span>Send Text Messages</span>
                        <Switch checked={sendPlain} setChecked={setSendPlain} />
                    </div>
                    <div className="Item"><span>Send Media</span>
                        <Switch checked={sendMedia} setChecked={setSendMedia} />
                    </div>
                    <div className="Item"><span>Add Users</span>
                        <Switch checked={inviteUsers} setChecked={setInviteUsers} />
                    </div>
                    <div className="Item"><span>Pin Messages</span>
                        <Switch checked={pinMessages} setChecked={setPinMessages} />
                    </div>
                </div>
            </div>
        </div>
    </>
}