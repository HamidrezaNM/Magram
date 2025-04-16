import { memo, useEffect, useRef, useState } from "react";
import ChatInfo from "./MiddleColumn/ChatInfo";
import PinnedMessage from "./MiddleColumn/PinnedMessage";
import Thread from "./MiddleColumn/Thread";
import { Icon } from "./common";
import { client } from "../../App";
import { Api } from "telegram";
import Composer from "./MiddleColumn/Composer";
import { useSelector } from "react-redux";
import Messages from "./Messages";
import { generateChatWithPeer } from "../Helpers/chats";
import buildClassName from "../Util/buildClassName";

function MiddleColumn({ }) {
    const [composerChat, setComposerChat] = useState()

    const MessagesRef = useRef()
    const BottomRef = useRef();
    const scrollToBottom = useRef();
    const background = useRef();
    const canvas = useRef();

    const activeChat = useSelector((state) => state.ui.activeChat)
    const chats = useSelector((state) => state.chats.value)
    const thread = useSelector((state) => state.ui.thread)
    const darkMode = useSelector((state) => state.ui.darkMode)

    const maskPattern = darkMode

    const handleScrollToBottom = () => {
        MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (thread) {
            (async () => {
                const linkedChatId = chats[thread.chatId.value].fullChat?.linkedChatId?.value

                if (linkedChatId) {
                    const discussionChat = await client.getEntity(linkedChatId)
                    setComposerChat(generateChatWithPeer(discussionChat))
                }
            })()
        } else
            setComposerChat(activeChat)
    }, [thread, activeChat])

    useEffect(() => {
        if (!canvas.current) return

        var ctx = canvas.current.getContext("2d");

        var length = background.current.clientWidth, angle = 0;
        var grd = ctx.createLinearGradient(0, 0, 0 + Math.cos(angle) * length, 0 + Math.sin(angle) * length);

        grd.addColorStop(0, "#3d2471");
        grd.addColorStop(1, "#002b29");
        // grd.addColorStop(.66, "#962fbf");
        // grd.addColorStop(1, "#4f5bd5");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, background.current.clientWidth, background.current.clientHeight);
    }, [background.current?.clientWidth, maskPattern])

    return <>
        <div className={buildClassName("background", "green", maskPattern && "has-mask-pattern")} ref={background}>
            {maskPattern && <div className="MaskPattern">
                <canvas width={background.current?.clientWidth} height={background.current?.clientHeight} ref={canvas}></canvas>
            </div>}
        </div>
        {activeChat && <div className="Content">
            <div className="TopBar">
                <ChatInfo key={activeChat.id.value} />
                <PinnedMessage />
            </div>
            {!thread ? <Messages MessagesRef={MessagesRef} /> :
                <Thread ThreadRef={MessagesRef} />}
            <div ref={scrollToBottom} className="scrollToBottom hidden" onClick={handleScrollToBottom}>
                <Icon name="arrow_downward" />
            </div>
            <div className="bottom" ref={BottomRef}>
                {composerChat && <Composer key={activeChat.id?.value} chat={thread ? composerChat : activeChat} thread={thread} scrollToBottom={scrollToBottom} handleScrollToBottom={handleScrollToBottom} />}
            </div>
        </div>}
    </>
}

export default memo(MiddleColumn)