import { memo, useEffect, useState } from "react";
import { Profile } from "../App/common";
import { client } from "../../App";
import { Api } from "telegram";
import { useDispatch } from "react-redux";
import { handleToast } from "../Stores/UI";
import Dialog, { DialogButton, DialogCancel, DialogContent, DialogContentBody, DialogTitle } from "../UI/Dialog";
import { getChatType } from "../Helpers/chats";

function DeleteMessageDialog({ data, onDeleteMessage }) {
    const [open, setOpen] = useState(true)

    const dispatch = useDispatch()

    const chatType = getChatType(data._chat)

    // const joinChat = async () => {
    //     try {
    //         const update = await client.invoke(new Api.messages.ImportChatInvite({
    //             hash
    //         }))
    //     } catch (error) {
    //         const title = error.errorMessage === 'INVITE_REQUEST_SENT' ? 'Invite request has been sent' : error.errorMessage
    //         dispatch(handleToast({ icon: 'error', title }))
    //     }

    //     setOpen(false)
    // }

    // const renderChatParticipantsCount = () => {
    //     return `${chat.participantsCount} ${(chat.broadcast ? 'subscribers' : 'members')}`
    // }

    return <Dialog state={open}>
        <DialogContent>
            <DialogContentBody>
                <DialogTitle>
                    Are you sure you want to delete this message
                </DialogTitle>
            </DialogContentBody>
            {(chatType === 'User' || chatType === 'Bot') &&
                <DialogButton className="danger" onClick={() => { onDeleteMessage(false); setOpen(false) }}>
                    Delete for me
                </DialogButton>
            }
            <DialogButton className="danger" onClick={() => { onDeleteMessage(true); setOpen(false) }}>
                {data._chat?.firstName ? `Delete for me and ${data._chat.firstName}` : 'Delete for Everyone'}
            </DialogButton>
        </DialogContent>
        <DialogButton className="Cancel" onClick={() => setOpen(false)}>
            Cancel
        </DialogButton>
    </Dialog>
}

export default memo(DeleteMessageDialog)