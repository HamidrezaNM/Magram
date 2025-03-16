import { memo } from "react"
import MenuItem from "../UI/MenuItem"

function ChatContextMenu({ canMute, canMarkAsRead, canPin, canUnpin, canDelete, onMute, onMarkAsRead, onPin, onDelete }) {
    return <>
        {canMute && <MenuItem icon="volume_off" title="Mute" onClick={onMute} />}
        {canMarkAsRead && <MenuItem icon="mark_chat_read" title="Mark as Read" onClick={onMarkAsRead} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canDelete && <MenuItem icon="delete" title="Delete" className="danger" onClick={onDelete} />}
    </>
}

export default memo(ChatContextMenu)