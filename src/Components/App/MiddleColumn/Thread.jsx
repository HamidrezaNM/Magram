import { forwardRef, memo, useContext, useEffect, useRef, useState } from "react";
import { AuthContext, UserContext } from "../../Auth/Auth";
import { useDispatch, useSelector } from "react-redux";
import { goToMessage } from "../Home";
import { handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage, handleThread } from "../../Stores/UI";
import Message from "../Message";
import MessagesLoading from "../../UI/MessagesLoading";
import { getMessageText } from "../MessageText";
import { client } from "../../../App";
import { Api } from "telegram";
import { readHistory } from "../../Util/messages";
import { setMessages } from "../../Stores/Messages";
import ContextMenu from "./ContextMenu";

const Thread = forwardRef(({ ThreadRef }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [messagesRenderCount, setMessagesRenderCount] = useState(20)

    const Auth = useContext(AuthContext)
    const User = useContext(UserContext)

    const activeChat = useSelector((state) => state.ui.activeChat)
    const thread = useSelector((state) => state.ui.thread)

    const chatId = `${thread.chatId.value}_${thread.id}`

    const messages = useSelector((state) => state.messages.value[chatId])
    const _goToMessage = useSelector((state) => state.ui.goToMessage)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)

    const dispatch = useDispatch()

    const isLoading = useRef(false)
    const autoScroll = useRef(false);
    const scrollToBottom = document.querySelector('.scrollToBottom')
    const BottomRef = document.querySelector('.bottom')

    const onGetMessages = (data) => {
        setIsLoaded(true)
        // if (messages[activeChat.id.value]?.length !== data?.length) {
        ThreadRef.current.classList.add('MessagesAnimating', 'animateFromTop')
        dispatch(setMessages({ chatId, messages: data.reverse() }))
        data?.filter((item) => item.pinned).map((message) => dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(message, User._id), messageId: message._id })))

        readHistory(thread.chatId?.value, dispatch)
    }

    const handleScrollToBottom = () => {
        ThreadRef.current.scroll({ left: 0, top: ThreadRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (messages?.length && autoScroll.current) {
            handleScrollToBottom()
        }
    }, [messages?.length]) // Scroll to Bottom on ReceiveMessage and SendMessage

    useEffect(() => {
        (async () => {
            setIsLoaded(false)
            setMessagesRenderCount(20)
            // if (messages[activeChat.id.value]?.length > 0) {
            //     isLoading.current = false
            // requestAnimationFrame(() => {
            //     ThreadRef.current.scroll({ left: 0, top: ThreadRef.current.scrollHeight, behavior: "instant" })
            // })
            // }
            dispatch(handlePinnedMessage())

            const messagesLength = messages?.length
            let lastMessageId = undefined

            if (messagesLength > 0) {
                lastMessageId = messages[messagesLength - 1]?.id
            }

            const result = await client.invoke(new Api.messages.GetReplies({
                msgId: thread.id,
                peer: thread.chatId.value,
                minId: lastMessageId,
                limit: 100
            }));

            console.log('thread', result)

            if (result.messages.length) {
                let parsedMessages = result.messages
                parsedMessages.map((item) => {
                    item._sender = result.users.find(user => user.id.value == item._senderId?.value)
                    if (item.replyTo.replyToMsgId != thread.id) {
                        item.replyToMessage = result.messages.find(message => message.id == item.replyTo.replyToMsgId)
                    }
                })

                onGetMessages(parsedMessages)
            } else {
                setIsLoaded(true)
                // readHistory(activeChat.id.value, dispatch)
            }

            document.querySelector('.scrollToBottom').style.bottom = document.querySelector('.bottom').clientHeight + 8 + 'px'
        })()
    }, []) // Get Messages on activeChat Changed

    const onScrollMessages = () => {
        if (document.querySelector('.scrollToBottom')) {
            if (Math.abs(ThreadRef.current.scrollHeight - ThreadRef.current.clientHeight - ThreadRef.current.scrollTop) > 30
                || 0 > ThreadRef.current.scrollTop) {
                document.querySelector('.scrollToBottom').classList.remove('hidden')
                document.querySelector('.scrollToBottom').style.bottom = document.querySelector('.bottom').clientHeight + 8 + 'px'
                autoScroll.current = false
            } else if (!document.querySelector('.scrollToBottom').classList.contains('hidden')) {
                document.querySelector('.scrollToBottom').classList.add('hidden')
                autoScroll.current = true
            }

            if (messages?.length > messagesRenderCount && Math.abs(ThreadRef.current.scrollHeight - ThreadRef.current.clientHeight - ThreadRef.current.scrollTop) < 1
                || 0 > ThreadRef.current.scrollTop) {
                console.log('message render count increase')
                ThreadRef.current.scroll({ left: 0, top: ThreadRef.current.scrollTop - 1, behavior: "instant" })
                setMessagesRenderCount(messages?.length < messagesRenderCount * 2 ? messages?.length : messagesRenderCount * 2)
            }
        }
    }

    useEffect(() => {
        if (activeChat && messages?.length && isLoading.current) {
            // ThreadRef.current.scroll({ left: 0, top: ThreadRef.current.scrollHeight, behavior: "instant" })
            isLoading.current = false
        }

        if (activeChat && messages?.length >= 0) {
            const items = ThreadRef.current.querySelectorAll('.MessagesAnimating .Message')
            const itemsLength = Object.keys(items).length

            if (itemsLength) {
                Object.values(items).forEach((item, index) => {
                    setTimeout(() => item.classList.add('showAnim'), 20 * index)
                })

                setTimeout(() => {
                    ThreadRef.current?.classList?.remove('MessagesAnimating')
                }, itemsLength * 20);
            }
        }
    }, [activeChat, messages, messagesRenderCount]) // Scroll to Bottom on Load

    useEffect(() => {
        if (activeChat.id.value != thread.chatId) {
            dispatch(handleThread())
        }
    }, [activeChat?.id])

    useEffect(() => {
        if (_goToMessage) {
            const index = messages.indexOf(messages.filter((item) => item.id === _goToMessage)[0])

            if (messages.length - index < messagesRenderCount) {
                goToMessage(_goToMessage)
            } else {
                setMessagesRenderCount(messages.length - index)
                setTimeout(() => {
                    goToMessage(_goToMessage)
                }, 40);
            }
            dispatch(handleGoToMessage())
        }
    }, [_goToMessage])

    const handleKeyUp = e => {
        if (e.keyCode === 38) {
            const data = messages;
            if (data.length > 0) {
                dispatch(handleEditMessage(data[data.length - 1]))
            }
        }
    }

    useEffect(() => {
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyUp, messages]);

    console.log('Messages Rerender')

    return <div className="MessageList scrollable" ref={ThreadRef} onScroll={onScrollMessages}>
        <div className="ThreadMessage">
            <Message key={activeChat.id?.value + '_' + thread?.id} data={thread} prevMsgFrom={thread.date} prevMsgDate={thread.date} nextMsgFrom={thread._senderId?.value} />
        </div>
        {messages ? <>
            {messages.slice(0, Math.max(messagesRenderCount, 0)).map((item, index) => (
                <Message
                    isThread={true}
                    key={thread.chatId?.value + '_' + item?.id}
                    data={item} prevMsgFrom={messages[index - 1]?._senderId?.value}
                    prevMsgDate={messages[index - 1]?.date}
                    nextMsgFrom={messages[index + 1]?._senderId?.value}
                    isiOS={iOSTheme} />
            ))}
            {!isLoaded && <div className="loading">
                {<MessagesLoading />}
            </div>
            }
        </> :
            !isLoaded && <div className="loading">
                {<MessagesLoading />}
            </div>}
        <ContextMenu type="message" />
    </div>

})

export default memo(Thread)