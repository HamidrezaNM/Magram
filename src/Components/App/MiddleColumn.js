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

function MiddleColumn({ }) {
    const [composerChat, setComposerChat] = useState()

    const MessagesRef = useRef()
    const BottomRef = useRef();
    const scrollToBottom = useRef();

    const activeChat = useSelector((state) => state.ui.value.activeChat)
    const chats = useSelector((state) => state.chats.value)
    const thread = useSelector((state) => state.ui.value.thread)

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

    return <>
        <div className="background purple"></div>
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