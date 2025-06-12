import { memo } from "react"
import { useSelector } from "react-redux"
import JoinChatDialog from "../common/JoinChatDialog"
import DeleteMessageDialog from "../common/DeleteMessageDialog"
import ClearCacheDialog from "../common/ClearCacheDialog"

function Dialogs() {
    const dialogs = useSelector((state) => state.ui.dialogs)

    const renderDialog = (dialog) => {
        switch (dialog.type) {
            case 'joinChat':
                return <JoinChatDialog chat={dialog.chat} hash={dialog.hash} />
            case 'deleteMessage':
                return <DeleteMessageDialog data={dialog.message} onDeleteMessage={dialog.onDeleteMessage} />
            case 'clearCache':
                return <ClearCacheDialog onClearCache={dialog.onClearCache} />
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