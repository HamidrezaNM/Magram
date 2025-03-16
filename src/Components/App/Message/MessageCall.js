import { memo, useContext } from "react";
import { Icon } from "../common";
import { UserContext } from "../../Auth/Auth";

function MessageCall({ data }) {
    const User = useContext(UserContext)

    let statusText = ''
    let durationText = ''

    switch (data.call?.status) {
        case 'answered':
            if (data.from._id === User._id)
                statusText = 'Outgoing Call'
            else
                statusText = 'Incoming Call'

            if (data.call?.duration / 3600 >= 2)
                durationText = Math.floor(data.call?.duration / 3600) + ' hours'
            else if (data.call?.duration / 3600 >= 1)
                durationText = Math.floor(data.call?.duration / 3600) + ' hour'
            else if (data.call?.duration / 60 >= 2)
                durationText = Math.floor(data.call?.duration / 60) + ' minutes'
            else if (data.call?.duration / 60 >= 1)
                durationText = Math.floor(data.call?.duration / 60) + ' minute'
            else
                durationText = data.call?.duration + ' seconds'
            break;
        case 'declined':
            statusText = 'Declined Call'
            break;
        default:
            if (data.from._id === User._id)
                statusText = 'Outgoing Call'
            else
                statusText = 'Incoming Call'
            break;
    }

    return <div className={"message-call" + (data.message ? ' without-margin' : '')}>
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