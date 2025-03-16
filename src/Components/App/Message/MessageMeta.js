import { memo } from "react";
import MessageSeen from "./MessageSeen";
import { toDoubleDigit } from "../Home";

function MessageMeta({ edited, seen, time, isOutMessage }) {
    return <div className="message-details">
        {edited && <span>edited</span>}
        <div className="message-time">{`${toDoubleDigit(
            time.getHours()
        )}:${toDoubleDigit(time.getMinutes())}`}</div>
        {isOutMessage.current && (
            <MessageSeen seen={seen} />
        )}
    </div>
}

export default memo(MessageMeta)