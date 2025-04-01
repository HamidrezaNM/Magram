import MenuItem from "../UI/MenuItem";

export default function MessageContextMenu({ canReply, canCopy, isPhoto, canPin, canUnpin, canRetractVote, canEdit, canDelete, onReply, onCopy, onSavePhoto, onPin, onRetractVote, onEdit, onDelete }) {
    return <>
        {canReply && <MenuItem icon="reply" title="Reply" onClick={onReply} />}
        {canCopy && <MenuItem icon="content_copy" title="Copy" onClick={onCopy} />}
        {isPhoto && <MenuItem icon="download" title="Save Photo" onClick={onSavePhoto} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canEdit && <MenuItem icon="edit" title="Edit" onClick={onEdit} />}
        {canRetractVote && <MenuItem icon="remove_done" title="Retract Vote" onClick={onRetractVote} />}
        {canDelete && <MenuItem icon="delete" title="Delete" onClick={onDelete} />}
    </>
}