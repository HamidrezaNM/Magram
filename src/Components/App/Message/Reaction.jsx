import { memo, useEffect, useRef, useState } from "react"
import { client } from "../../../App"
import { Api } from "telegram"
import StarIcon from "../../common/StarIcon"
import buildClassName from "../../Util/buildClassName"
import CustomEmoji from "./CustomEmoji"
import { useDispatch, useSelector } from "react-redux"
import { handlePositionTransitionElement } from "../../common/PositionTransition"
import Transition from "../Transition"

function Reaction({ messageId, chatId, emoticon, emojiId, isPaid, count, isActive }) {
    const [active, setActive] = useState(isActive)
    const parsedCount = isActive ? count - 1 : count

    const positionTransition = useSelector(state => state.ui.positionTransition.find(x => x.id === messageId + emoticon)) // state.ui.positionTransition[0]?.type === 'reaction' && state.ui.positionTransition[0]?.emoticon === emoticon && 

    const reactionRef = useRef()
    const emoticonRef = useRef()

    const dispatch = useDispatch()

    const onClick = async () => {
        const _active = !active
        navigator.vibrate(1)
        setActive(_active)
        await client.invoke(new Api.messages.SendReaction({
            msgId: messageId,
            peer: chatId,
            reaction: _active ? [new Api.ReactionEmoji({ emoticon })] : [new Api.ReactionEmpty()]
        }))
    }

    // useEffect(() => {
    //     if (rect) {
    //         ref.current.style.position = 'absolute'
    //         ref.current.style.top = rect.top + 'px'
    //         ref.current.style.left = rect.left + 'px'
    //     }
    // }, [rect])

    useEffect(() => {
        setActive(isActive)
    }, [isActive])

    useEffect(() => {
        console.log('position', positionTransition)
        setTimeout(() => {
            if (positionTransition && emoticonRef.current) {
                const rect = emoticonRef.current.getBoundingClientRect()
                const clone = emoticonRef.current.cloneNode(true)
                clone.classList.add('placeholder')

                reactionRef.current.insertBefore(clone, emoticonRef.current)

                const onEnd = () => {
                    clone.remove()
                }

                handlePositionTransitionElement(positionTransition.id, positionTransition.from, rect, emoticonRef.current, dispatch, onEnd)
            }
        }, 40)
    }, [positionTransition])

    return <Transition state={(active ? parsedCount + 1 : parsedCount) > 0}>
        <div className={buildClassName("reaction", active && 'active')} ref={reactionRef} style={{ backgroundColor: isPaid && '#FFBC2E33' }} onClick={onClick}>
            <span className="emoticon" ref={emoticonRef}>
                {emojiId ?
                    <CustomEmoji documentId={emojiId} />
                    : isPaid ?
                        <StarIcon type="gold" size="adaptive" style={{ width: 20, height: 20 }} />
                        : emoticon
                }
            </span> <span>{active ? parsedCount + 1 : parsedCount}
            </span>
        </div>
    </Transition>
}

export default memo(Reaction)