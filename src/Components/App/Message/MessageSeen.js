import { memo, useContext } from "react"
import { UserContext } from "../../Auth/Auth"

function MessageSeen({ seen }) {
    return <div className={"message-seen icon" + (seen === -1 ? ' danger' : '')}>
        {seen === true
            ? "done_all"
            : seen === false
                ? "done"
                : (seen === -1)
                    ? 'error'
                    : "schedule" // "schedule"
        }
    </div>
}

export default memo(MessageSeen)