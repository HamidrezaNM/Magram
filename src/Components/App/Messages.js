import { forwardRef, memo, useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, unshiftMessages } from "../Stores/Messages";
import { handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage } from "../Stores/UI";
import MessagesLoading from "../UI/MessagesLoading";
import { client } from "../../App";
import { getMessageText } from "./MessageText";
import { goToMessage } from "./Home";
import { Api } from "telegram";
import { readHistory } from "../Util/messages";
import buildClassName from "../Util/buildClassName";
import { getChatType } from "../Helpers/chats";

const Messages = forwardRef(({ MessagesRef }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [messagesRenderCount, setMessagesRenderCount] = useState(20)
    const [messageParts, setMessageParts] = useState([])

    const activeChat = useSelector((state) => state.ui.activeChat)
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const messages = useSelector((state) => state.messages.value[activeChat.id.value])
    const _goToMessage = useSelector((state) => state.ui.goToMessage)

    const dispatch = useDispatch()

    const isLoading = useRef(false)
    const autoScroll = useRef(true);
    const unreadMessages = useRef();

    const messageStartIndex = messages?.length - messagesRenderCount > 0 ? messages?.length - messagesRenderCount : 0

    const onGetMessages = async (data, overwrite = false) => {
        setIsLoaded(true)
        setTimeout(() => {
            MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight + 3000, behavior: "instant" })
        }, 40)
        if (messages?.length !== data?.total) {
            MessagesRef.current.classList.add('MessagesAnimating')
            dispatch(setMessages({ chatId: activeChat.id.value, messages: data.reverse(), overwrite }))

            handlePinnedMessages()

            setTimeout(() => {
                MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
            }, 300)

            readHistory(activeChat.id.value, dispatch)
        } else {
            messages?.filter((item) => item.pinned).map((message) => dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(message), messageId: message.id })))
        }
    }

    const handleScrollToBottom = () => {
        MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (messages?.length && autoScroll.current) {
            handleScrollToBottom()
        }
    }, [messages?.length]) // Scroll to Bottom on ReceiveMessage and SendMessage

    useEffect(() => {
        (async () => {
            if (activeChat) {
                setIsLoaded(false)
                setMessagesRenderCount(20)
                if (messages?.length > 0) {
                    isLoading.current = false
                    requestAnimationFrame(() => {
                        MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
                    })
                }
                dispatch(handlePinnedMessage())

                const messagesLength = messages?.length
                let lastMessageId = null

                if (messagesLength > 0) {
                    lastMessageId = messages[messagesLength - 1]?.id
                }

                const result = await client.getMessages(
                    activeChat.id.value,
                    {
                        limit: 100,
                        minId: lastMessageId
                    }
                );

                if (result.total > messagesLength && messagesLength < 100) {
                    const all = await client.getMessages(
                        activeChat.id.value,
                        {
                            limit: 100
                        }
                    );

                    onGetMessages(all, true)
                }

                if (result.length)
                    onGetMessages(result)
                else {
                    setIsLoaded(true)
                    handlePinnedMessages()
                    readHistory(activeChat.id.value, dispatch)
                }

                document.querySelector('.scrollToBottom').style.bottom = document.querySelector('.bottom').clientHeight + 8 + 'px'
            }
        })()
    }, [activeChat?.id]) // Get Messages on activeChat Changed

    const onScrollMessages = async () => {
        if (document.querySelector('.scrollToBottom')) {
            if (Math.abs(MessagesRef.current.scrollHeight - MessagesRef.current.clientHeight - MessagesRef.current.scrollTop) > 30
                || 0 > MessagesRef.current.scrollTop) {
                document.querySelector('.scrollToBottom').classList.remove('hidden')
                document.querySelector('.scrollToBottom').style.bottom = document.querySelector('.bottom').clientHeight + 8 + 'px'
                autoScroll.current = false
            } else if (!document.querySelector('.scrollToBottom').classList.contains('hidden')) {
                document.querySelector('.scrollToBottom').classList.add('hidden')
                autoScroll.current = true
            }

            if (isLoaded && messages?.length > 20 && MessagesRef.current.scrollTop < 1) {
                if (messages?.length <= messagesRenderCount) {
                    setIsLoaded(true)
                    // const messagesLength = messages?.length
                    let maxMessageId = null

                    // if (messagesLength > 0) {
                    maxMessageId = messages[0]?.id
                    // }

                    const result = await client.getMessages(
                        activeChat.id,
                        {
                            limit: 100,
                            maxId: maxMessageId
                        }
                    );

                    setIsLoaded(false)
                    if (result?.length) {
                        dispatch(unshiftMessages({ chatId: activeChat.id.value, messages: result.reverse() }))
                        setMessagesRenderCount(messages.length + result.length < messagesRenderCount * 2 ? messages.length + result.length : messagesRenderCount * 2)
                    } else
                        return
                } else
                    setMessagesRenderCount(messages?.length < messagesRenderCount * 2 ? messages?.length : messagesRenderCount * 2)
                console.log('message render count increase')
                MessagesRef.current.scroll({ left: 0, top: 1, behavior: "instant" })
            }
        }
    }

    useEffect(() => {
        if (activeChat && messages?.length && isLoading.current) {
            MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
            isLoading.current = false
        }

        if (activeChat && messages?.length) {
            const items = MessagesRef.current.querySelectorAll('.MessagesAnimating .Message')
            const itemsLength = Object.keys(items).length

            if (itemsLength) {
                Object.values(items).reverse().forEach((item, index) => {
                    setTimeout(() => item.classList.add('showAnim'), 20 * index)
                })

                setTimeout(() => {
                    MessagesRef.current?.classList?.remove('MessagesAnimating')
                }, itemsLength * 20);
            }
        }
    }, [activeChat, messages, messagesRenderCount]) // Scroll to Bottom on Load

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

    const handlePinnedMessages = async () => {
        const pinned = await client.getMessages(
            activeChat.id.value,
            {
                filter: Api.InputMessagesFilterPinned,
                reverse: true
            }
        );

        pinned.map((message) => dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(message), messageId: message.id })))
    }

    const handleKeyUp = e => {
        if (e.keyCode === 38) {
            const data = messages[activeChat._id];
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

    return <div className={buildClassName(
        "Messages",
        "scrollable",
        (!messages?.length && isLoaded) && 'NoMessages'
    )} ref={MessagesRef} onScroll={onScrollMessages}>
        {messages || !isLoaded ? <>
            {
                !isLoaded && <div className="loading">
                    <MessagesLoading />
                </div>
            }
            {
                messages && messages
                    .slice(Math.max(messages.length - messagesRenderCount, 0))
                    .map((item, index) => (
                        <>
                            <Message key={activeChat.id?.value + '_' + item?.id}
                                data={item}
                                seen={activeChat?.dialog?.readOutboxMaxId >= item?.id}
                                prevMsgFrom={messages[messageStartIndex + index - 1]?._senderId?.value}
                                prevMsgDate={messages[messageStartIndex + index - 1]?.date}
                                nextMsgFrom={messages[messageStartIndex + index + 1]?._senderId?.value}
                            />
                            {
                                item.id === activeChat?.dialog?.readInboxMaxId &&
                                item.id !== activeChat?.dialog.topMessage &&
                                <div ref={unreadMessages} className="UnreadMessages">Unread Messages</div>
                            }
                        </>
                    ))
            }
        </> :
            (<div className="NoMessage Message">
                <div className="bubble">
                    <div className="bubble-content">
                        <div className="message-text">
                            {getChatType(activeChat?.entity) === 'Bot' ?
                                <span>
                                    {fullChat?.botInfo?.description}
                                </span>
                                : <span>No messages here yet...</span>
                            }
                        </div>
                    </div>
                </div>
            </div>)}
    </div>

})

export default memo(Messages)