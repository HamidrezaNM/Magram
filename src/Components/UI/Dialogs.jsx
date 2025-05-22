import { memo } from "react"
import { useSelector } from "react-redux"
import JoinChatDialog from "../common/JoinChatDialog"
import Dialog, { DialogButton, DialogCancel, DialogContent, DialogContentBody, DialogTitle } from "./Dialog"
import DeleteMessageDialog from "../common/DeleteMessageDialog"

function Dialogs() {
    const dialogs = useSelector((state) => state.ui.dialogs)

    const renderDialog = (dialog) => {
        switch (dialog.type) {
            case 'joinChat':
                return <JoinChatDialog chat={dialog.chat} hash={dialog.hash} />
            case 'deleteMessage':
                return <DeleteMessageDialog />
            default:
                break;
        }
    }

    return <>
        {dialogs.map(dialog => {
            return renderDialog(dialog)
        })}
    </>
}

export default memo(Dialogs)