import { memo, useContext } from "react"
import { UserContext } from "../../Auth/Auth"

function MessageSeen({ seen }) {
    const User = useContext(UserContext)
    return <div className={"message-seen icon" + (seen === -1 ? ' danger' : '')}>
        {seen
            ? "done_all"
            : seen === false
                ? "done"
                : (!seen)
                    ? 'error'
                    : "done" // "schedule"
        }
    </div>
}

export default memo(MessageSeen)