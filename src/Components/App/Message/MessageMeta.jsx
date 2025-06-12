import { memo } from "react";
import MessageSeen from "./MessageSeen";
import { toDoubleDigit } from "../Home";
import { Icon } from "../common";

function MessageMeta({ edited, views, postAuthor, seen, time, isOutMessage }) {
    return <div className="message-details">
        {views && <span className="message-views">
            {views}
            <Icon size={16} name="visibility" />
        </span>}
        {postAuthor && <span>{postAuthor},</span>}
        {edited && <span>edited</span>}
        <div className="message-time">{`${toDoubleDigit(
            time.getHours()
        )}:${toDoubleDigit(time.getMinutes())}`}</div>
        {isOutMessage.current && !views && (
            <MessageSeen seen={seen} />
        )}
    </div>
}

export default memo(MessageMeta)