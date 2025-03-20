import { memo, useState } from "react"
import { client } from "../../../App"
import { Api } from "telegram"

function Reaction({ messageId, chatId, emoticon, count, isActive }) {
    const [active, setActive] = useState(isActive)
    const parsedCount = isActive ? count - 1 : count

    const onClick = async () => {
        const _active = !active
        setActive(_active)
        await client.invoke(new Api.messages.SendReaction({
            msgId: messageId,
            peer: chatId,
            reaction: _active ? [new Api.ReactionEmoji({ emoticon })] : [new Api.ReactionEmpty()]
        }))
    }

    return <div className={"reaction" + (active ? ' active' : '')} onClick={onClick}><span className="emoticon">{emoticon}</span> <span>{active ? parsedCount + 1 : parsedCount}</span></div>
}

export default memo(Reaction)