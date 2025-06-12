import { memo } from "react"
import MenuItem from "../UI/MenuItem"

function ChatContextMenu({ canMute, canMarkAsRead, canArchive, canUnarchive, canPin, canUnpin, canDelete, onMute, onMarkAsRead, onArchive, onUnarchive, onPin, onDelete }) {
    return <>
        {canArchive && <MenuItem icon="archive" title="Archive" onClick={onArchive} />}
        {canUnarchive && <MenuItem icon="unarchive" title="Unarchive" onClick={onUnarchive} />}
        {canMute && <MenuItem icon="volume_off" title="Mute" onClick={onMute} />}
        {canMarkAsRead && <MenuItem icon="mark_chat_read" title="Mark as Read" onClick={onMarkAsRead} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canDelete && <MenuItem icon="delete" title="Delete" className="danger" onClick={onDelete} />}
    </>
}

export default memo(ChatContextMenu)