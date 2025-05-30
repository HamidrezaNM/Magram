import { memo, useEffect, useState } from "react";
import { Profile } from "../App/common";
import { client } from "../../App";
import { Api } from "telegram";
import { useDispatch } from "react-redux";
import { handleToast } from "../Stores/UI";
import Dialog, { DialogButton, DialogCancel, DialogContent, DialogContentBody, DialogTitle } from "../UI/Dialog";

function DeleteMessageDialog({ data }) {
    const [open, setOpen] = useState(true)

    const dispatch = useDispatch()

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
                    Are you sure you want to leave Test
                </DialogTitle>
            </DialogContentBody>
            <DialogButton className="danger">
                Delete for me and Jake
            </DialogButton>
        </DialogContent>
        <DialogButton className="Cancel" onClick={() => setOpen(false)}>
            Cancel
        </DialogButton>
    </Dialog>
}

export default memo(DeleteMessageDialog)