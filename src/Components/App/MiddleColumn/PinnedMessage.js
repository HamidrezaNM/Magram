import { memo, useCallback, useEffect, useRef, useState } from "react";
import Transition from "../Transition";
import { useDispatch, useSelector } from "react-redux";
import { goToMessage } from "../Home";
import { handleGoToMessage } from "../../Stores/UI";

function PinnedMessage() {
    const [pinnedMessageIndex, setPinnedMessageIndex] = useState(0);

    const pinnedMessage = useSelector((state) => state.ui.value.pinnedMessage)

    const pinnedMessageRef = useRef()

    const dispatch = useDispatch()

    const handlePinnedMessageClick = useCallback(() => {
        setPinnedMessageIndex(pinnedMessageIndex < pinnedMessage.length - 1 ? pinnedMessageIndex + 1 : 0)
        dispatch(handleGoToMessage(pinnedMessage[pinnedMessageIndex].messageId))
    }, [pinnedMessage, pinnedMessageIndex])

    const handleScroll = () => {
        if (pinnedMessage?.length > 3) {
            pinnedMessageRef.current?.querySelectorAll('.bars span')[pinnedMessage.length - 1 - pinnedMessageIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            })
        }
    }

    useEffect(() => {
        handleScroll()
    }, [pinnedMessageRef, pinnedMessageIndex, pinnedMessage?.length])

    return pinnedMessage?.length > 0 && <Transition state={true} activeAction={handleScroll}>
        <div className="PinnedMessage animate" ref={pinnedMessageRef} onClick={handlePinnedMessageClick}>
            <div style={{ overflow: 'hidden', height: '48px' }}>
                <div className={"bars" + (pinnedMessage.length > 4 ? ' more' : '')}>
                    {pinnedMessage.map((i, index) => <span key={index} className={(pinnedMessage.length - 1 - index === pinnedMessageIndex ? 'active' : '') + (pinnedMessage.length - 1 - index + 1 === pinnedMessageIndex ? 'deactive' : '')}></span>)}
                </div>
            </div>
            <div className="FlexColumn">
                <div className="title">{pinnedMessage[pinnedMessageIndex]?.title}</div>
                <div className="subtitle" dir="auto">{pinnedMessage[pinnedMessageIndex]?.subtitle}</div>
            </div>
        </div>
    </Transition>
}

export default memo(PinnedMessage)