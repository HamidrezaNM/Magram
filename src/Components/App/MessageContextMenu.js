import { useEffect, useState } from "react";
import MenuItem from "../UI/MenuItem";
import { Profile } from "./common";
import { formatTime } from "../Util/dateFormat";
import { getDate } from "./Message";

export default function MessageContextMenu({
    canReply,
    canCopy,
    canCopyLink,
    isPhoto,
    canPin,
    canUnpin,
    canRetractVote,
    canSaveGif,
    canEdit,
    canForward,
    canDelete,
    canReadParticipants,
    canReadDate,

    onReply,
    onCopy,
    onCopyLink,
    onSavePhoto,
    onPin,
    onRetractVote,
    onSaveGif,
    onEdit,
    onForward,
    onDelete,
    readParticipants,
    readDate
}) {
    return <>
        {canReply && <MenuItem icon="reply" title="Reply" onClick={onReply} />}
        {canCopy && <MenuItem icon="content_copy" title="Copy" onClick={onCopy} />}
        {canCopyLink && <MenuItem icon="link" title="Copy Link" onClick={onCopyLink} />}
        {isPhoto && <MenuItem icon="download" title="Save Photo" onClick={onSavePhoto} />}
        {canPin && <MenuItem icon="keep" title="Pin" onClick={onPin} />}
        {canUnpin && <MenuItem icon="keep" title="Unpin" onClick={onPin} />}
        {canEdit && <MenuItem icon="edit" title="Edit" onClick={onEdit} />}
        {canRetractVote && <MenuItem icon="remove_done" title="Retract Vote" onClick={onRetractVote} />}
        {canSaveGif && <MenuItem icon="gif_box" title="Add to GIFs" onClick={onSaveGif} />}
        {canForward && <MenuItem icon="forward" title="Forward" onClick={onForward} />}
        {canDelete && <MenuItem icon="delete" className="danger" title="Delete" onClick={onDelete} />}
        {(canReadParticipants || canReadDate) && <hr />}
        {canReadParticipants && <MessageReadParticipants readParticipants={readParticipants} />}
        {canReadDate && <MessageReadDate readDate={readDate} />}
    </>
}

function MessageReadParticipants({ readParticipants }) {
    const [data, setData] = useState()

    useEffect(() => {
        (async () => {
            if (readParticipants) {
                try {
                    const getReadParticipants = await readParticipants()

                    setData(getReadParticipants.reverse())
                } catch (error) {

                }
            }
        })()
    }, [readParticipants])

    return <div className="MenuItem" style={{ flexDirection: 'row', paddingRight: 4 }} onClick={() => { }}>
        <div className="icon">done_all</div>
        <div className="ReadParticipants">
            <div className="title">{data?.length} Seen</div>
            <div className="meta ParticipantProfiles">
                {data && data.map((item) => {
                    return item?.accessHash &&
                        <Profile size={28}
                            entity={item}
                            id={item.id?.value}
                            name={item.firstName} />
                })}
            </div>
        </div>
    </div>
}

function MessageReadDate({ readDate }) {
    const [date, setDate] = useState()

    useEffect(() => {
        (async () => {
            if (readDate) {
                try {
                    const getReadDate = await readDate()

                    setDate(getReadDate)
                } catch (error) {
                    setDate(error.errorMessage)
                }
            }
        })()
    }, [readDate])

    return <MenuItem icon="done_all" title={date && (isNaN(date) ? date : `read at ${getDate(date * 1000, true, true)} ${formatTime(date * 1000)}`)} />
}