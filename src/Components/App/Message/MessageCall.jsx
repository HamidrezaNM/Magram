import { memo } from "react";
import { Icon } from "../common";

function MessageCall({ data }) {
    let statusText = ''
    let durationText = ''

    switch (data.action?.reason.className) {
        case 'PhoneCallDiscardReasonHangup':
            if (data.out)
                statusText = 'Outgoing Call'
            else
                statusText = 'Incoming Call'

            const duration = data.action.duration

            if (duration / 3600 >= 2)
                durationText = Math.floor(duration / 3600) + ' hours'
            else if (duration / 3600 >= 1)
                durationText = Math.floor(duration / 3600) + ' hour'
            else if (duration / 60 >= 2)
                durationText = Math.floor(duration / 60) + ' minutes'
            else if (duration / 60 >= 1)
                durationText = Math.floor(duration / 60) + ' minute'
            else if (duration)
                durationText = duration + ' seconds'
            break;
        case 'PhoneCallDiscardReasonBusy':
            statusText = 'Declined Call'
            break;
        case 'PhoneCallDiscardReasonMissed':
            statusText = 'Missed Call'
            break;
        default:
            if (data.out)
                statusText = 'Outgoing Call'
            else
                statusText = 'Incoming Call'
            break;
    }

    return <div className="message-call">
        <div>
            <Icon name="call" />
        </div>
        <div className="details">
            <span className="status">
                {statusText}
            </span>
            {durationText && <p>{durationText}</p>}
        </div>
    </div>
}

export default memo(MessageCall)