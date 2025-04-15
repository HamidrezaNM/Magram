import MenuItem from "../UI/MenuItem";

export default function MessageContextMenu({ canReply, canCopy, isPhoto, canPin, canUnpin, canRetractVote, canEdit, canForward, canDelete, onReply, onCopy, onSavePhoto, onPin, onRetractVote, onEdit, onForward, onDelete }) {
    return <>
        {canReply && <MenuItem icon="reply" title="Reply" onClick={onReply} />}
        {canCopy && <MenuItem icon="content_copy" title="Copy" onClick={onCopy} />}
        {isPhoto && <MenuItem icon="download" title="Save Photo" onClick={onSavePhoto} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canEdit && <MenuItem icon="edit" title="Edit" onClick={onEdit} />}
        {canRetractVote && <MenuItem icon="remove_done" title="Retract Vote" onClick={onRetractVote} />}
        {canForward && <MenuItem icon="forward" title="Forward" onClick={onForward} />}
        {canDelete && <MenuItem icon="delete" className="danger" title="Delete" onClick={onDelete} />}
    </>
}