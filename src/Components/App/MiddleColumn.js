import { memo, useEffect, useRef, useState } from "react";
import ChatInfo from "./MiddleColumn/ChatInfo";
import PinnedMessage from "./MiddleColumn/PinnedMessage";
import Thread from "./MiddleColumn/Thread";
import { Icon } from "./common";
import { client } from "../../App";
import { Api } from "telegram";
import Composer from "./MiddleColumn/Composer";
import { useSelector } from "react-redux";
import Messages from "./MessageList";
import { generateChatWithPeer } from "../Helpers/chats";
import buildClassName from "../Util/buildClassName";
import MessageList from "./MessageList";
import { ChatBackgroundGradientRendererWebGL } from "../Util/gradientRenderer";
import VoiceChatInfo from "./MiddleColumn/VoiceChatInfo";

function MiddleColumn({ }) {
    const [composerChat, setComposerChat] = useState()

    const MessageListRef = useRef()
    const BottomRef = useRef();
    const scrollToBottom = useRef();
    const background = useRef();
    const gradientCanvasRef = useRef();

    const gradientRenderer = useRef();

    const activeChat = useSelector((state) => state.ui.activeChat)
    const chats = useSelector((state) => state.chats.value)
    const thread = useSelector((state) => state.ui.thread)
    const darkMode = useSelector((state) => state.settings.darkMode)

    const maskPattern = darkMode

    const handleScrollToBottom = () => {
        MessageListRef.current.scroll({ left: 0, top: MessageListRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (thread) {
            (async () => {
                const linkedChatId = chats[thread.chatId.value]?.fullChat?.linkedChatId?.value

                if (linkedChatId) {
                    const discussionChat = await client.getEntity(linkedChatId)
                    setComposerChat(generateChatWithPeer(discussionChat))
                }
            })()
        } else
            setComposerChat(activeChat)
    }, [thread, activeChat])

    useEffect(() => {
        if (!gradientCanvasRef.current) return

        // var ctx = canvas.current.getContext("2d");

        // var length = background.current.clientWidth, angle = 0;
        // var grd = ctx.createLinearGradient(0, 0, 0 + Math.cos(angle) * length, 0 + Math.sin(angle) * length);

        // grd.addColorStop(0, "#002b29");
        // grd.addColorStop(1, "#3d2471");
        // // grd.addColorStop(.66, "#962fbf");
        // // grd.addColorStop(1, "#4f5bd5");

        // ctx.fillStyle = grd;
        // ctx.fillRect(0, 0, background.current.clientWidth, background.current.clientHeight);

        const lightColors = '#9adf5b,#5bdfa1,#65df5b,#00db92';
        const darkColors = '#fec496,#dd6cb9,#962fbf,#4f5bd5';

        const colors = darkMode ? darkColors : lightColors

        gradientCanvasRef.current?.setAttribute('data-colors', colors);
        gradientCanvasRef.current.width = background.current.clientWidth;
        gradientCanvasRef.current.height = background.current.clientHeight;
        try {
            const renderer = ChatBackgroundGradientRendererWebGL.create(colors, gradientCanvasRef.current);
            gradientRenderer.current = renderer;
        } catch (e) {
            console.log('error', e)
            //   const renderer = ChatBackgroundGradientRenderer.create(colors, gradientCanvasRef.current);
            //   gradientRenderer = renderer;
        }
    }, [background.current?.clientWidth, maskPattern])

    return <>
        <div className={buildClassName("background", "green", maskPattern && "has-mask-pattern")} ref={background}>
            {<div className={maskPattern && "MaskPattern"}>
                <canvas style={{ opacity: `${darkMode ? 0.3 : 0.8}` }} width={background.current?.clientWidth} height={background.current?.clientHeight} ref={gradientCanvasRef}></canvas>
            </div>}
        </div>
        {activeChat && <div className="Content">
            <div className="TopBar">
                <ChatInfo key={activeChat.id.value} />
                <PinnedMessage />
                <VoiceChatInfo />
            </div>
            {!thread ? <MessageList MessageListRef={MessageListRef} gradientRenderer={gradientRenderer.current?.gradientRenderer} /> :
                <Thread ThreadRef={MessageListRef} />}
            <div ref={scrollToBottom} className="scrollToBottom hidden" onClick={handleScrollToBottom}>
                <Icon name="arrow_downward" />
            </div>
            <div className="bottom" ref={BottomRef} onClick={() => gradientRenderer.current?.gradientRenderer?.toNextPosition()}>
                {composerChat && <Composer key={activeChat.id?.value} chat={thread ? composerChat : activeChat} thread={thread} gradientRenderer={gradientRenderer.current?.gradientRenderer} scrollToBottom={scrollToBottom} handleScrollToBottom={handleScrollToBottom} />}
            </div>
        </div>}
    </>
}

export default memo(MiddleColumn)