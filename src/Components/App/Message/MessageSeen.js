import { memo, useContext } from "react"
import { UserContext } from "../../Auth/Auth"

function MessageSeen({ seen }) {
    const User = useContext(UserContext)
    return <div className={"message-seen icon" + (seen === -1 ? ' danger' : '')}>
        {seen?.length > 0 && (seen?.length > 1 || seen[0] !== User._id)
            ? "done_all"
            : (seen?.length === 0 || seen === 0 || (seen?.length === 1 && seen[0] === User._id))
                ? "done"
                : (seen === -1)
                    ? 'error'
                    : "done" // "schedule"
        }
    </div>
}

export default memo(MessageSeen)