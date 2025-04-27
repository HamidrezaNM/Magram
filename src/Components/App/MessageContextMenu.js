import MenuItem from "../UI/MenuItem";

export default function MessageContextMenu({ canReply, canCopy, isPhoto, canPin, canUnpin, canRetractVote, canSaveGif, canEdit, canForward, canDelete, onReply, onCopy, onSavePhoto, onPin, onRetractVote, onSaveGif, onEdit, onForward, onDelete }) {
    return <>
        {canReply && <MenuItem icon="reply" title="Reply" onClick={onReply} />}
        {canCopy && <MenuItem icon="content_copy" title="Copy" onClick={onCopy} />}
        {isPhoto && <MenuItem icon="download" title="Save Photo" onClick={onSavePhoto} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canEdit && <MenuItem icon="edit" title="Edit" onClick={onEdit} />}
        {canRetractVote && <MenuItem icon="remove_done" title="Retract Vote" onClick={onRetractVote} />}
        {canSaveGif && <MenuItem icon="gif_box" title="Add to GIFs" onClick={onSaveGif} />}
        {canForward && <MenuItem icon="forward" title="Forward" onClick={onForward} />}
        {canDelete && <MenuItem icon="delete" className="danger" title="Delete" onClick={onDelete} />}
    </>
}