import { memo, useState } from "react"
import { client } from "../../../App"
import { Api } from "telegram"
import StarIcon from "../../common/StarIcon"
import buildClassName from "../../Util/buildClassName"
import CustomEmoji from "./CustomEmoji"

function Reaction({ messageId, chatId, emoticon, emojiId, isPaid, count, isActive }) {
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

    return <div className={buildClassName("reaction", active && 'active')} style={{ backgroundColor: isPaid && '#FFBC2E33' }} onClick={onClick}>
        <span className="emoticon">
            {emojiId ?
                <CustomEmoji documentId={emojiId} />
                : isPaid ?
                    <StarIcon type="gold" size="adaptive" style={{ width: 20, height: 20 }} />
                    : emoticon
            }
        </span> <span>{active ? parsedCount + 1 : parsedCount}
        </span>
    </div>
}

export default memo(Reaction)