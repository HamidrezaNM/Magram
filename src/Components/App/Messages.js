import { forwardRef, memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { setMessages, unshiftMessages } from "../Stores/Messages";
import { handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage, handleToast } from "../Stores/UI";
import MessagesLoading from "../UI/MessagesLoading";
import { client } from "../../App";
import { getMessageText } from "./MessageText";
import { goToMessage } from "./Home";
import { Api } from "telegram";
import { readHistory } from "../Util/messages";
import buildClassName from "../Util/buildClassName";
import { getChatType } from "../Helpers/chats";
import ContextMenu from "./MiddleColumn/ContextMenu";

const Messages = forwardRef(({ MessagesRef }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [messagesRenderCount, setMessagesRenderCount] = useState(20)
    const [messageParts, setMessageParts] = useState([])

    const activeChat = useSelector((state) => state.ui.activeChat)
    const fullChat = useSelector((state) => state.ui.activeFullChat)
    const messages = useSelector((state) => state.messages.value[activeChat.id.value])
    const _goToMessage = useSelector((state) => state.ui.goToMessage)
    const iOSTheme = useSelector((state) => state.settings.customTheme.iOSTheme)

    const dispatch = useDispatch()

    const isLoading = useRef(false)
    const autoScroll = useRef(true);
    const previousScrollHeightMinusTop = useRef(0);
    const messageRenderIncrease = useRef(false);

    const chatType = getChatType(activeChat.entity)
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

                try {
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
                } catch (error) {
                    dispatch(handleToast({ icon: 'error', title: error.errorMessage }))
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
                previousScrollHeightMinusTop.current = MessagesRef.current.scrollHeight - MessagesRef.current.scrollTop
                messageRenderIncrease.current = true

                if (messages?.length <= messagesRenderCount) {
                    setIsLoaded(false)
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

                    setIsLoaded(true)
                    if (result?.length) {
                        dispatch(unshiftMessages({ chatId: activeChat.id.value, messages: result.reverse() }))
                        setMessagesRenderCount(messages.length + result.length < messagesRenderCount * 2 ? messages.length + result.length : messagesRenderCount * 2)
                    } else
                        return
                } else
                    setMessagesRenderCount(messages?.length < messagesRenderCount * 2 ? messages?.length : messagesRenderCount * 2)
                console.log('message render count increase', messages?.length < messagesRenderCount * 2 ? messages?.length : messagesRenderCount * 2)
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
        if (messageRenderIncrease.current && previousScrollHeightMinusTop.current > 0) {
            // setTimeout(() => {
            MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight - previousScrollHeightMinusTop.current, behavior: "instant" })
            console.log(MessagesRef.current.scrollTop, previousScrollHeightMinusTop.current)
            // }, 200);
            messageRenderIncrease.current = false
        }
    }, [messagesRenderCount])

    useEffect(() => {
        if (_goToMessage && messages) {
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
    }, [_goToMessage, messages])

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
            setMessagesRenderCount(messages?.length < messagesRenderCount + 1 ? messages?.length : messagesRenderCount + 1)

            // const data = messages[activeChat._id];
            // if (data.length > 0) {
            //     dispatch(handleEditMessage(data[data.length - 1]))
            // }
        }
    }

    useEffect(() => {
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [handleKeyUp, messages]);

    const getGroupedMessages = useGroupedMessages(messages, messageStartIndex);

    const renderMessage = (item, index) => {
        let groupedMessages

        if (item.groupedId) {
            groupedMessages = getGroupedMessages(item, index)
            if (groupedMessages === false) return
        }

        return <Message
            key={activeChat.id?.value + '_' + item?.id}
            data={item}
            seen={activeChat?.dialog?.readOutboxMaxId >= item?.id}
            prevMsgFrom={messages[messageStartIndex + index - 1]?._senderId?.value}
            prevMsgDate={messages[messageStartIndex + index - 1]?.date}
            nextMsgFrom={messages[messageStartIndex + index + 1]?._senderId?.value}
            groupedMessages={item.groupedId && groupedMessages}
            unreadFrom={
                item.id === activeChat?.dialog?.readInboxMaxId &&
                item.id !== activeChat?.dialog.topMessage
            }
            chatType={chatType}
            isiOS={iOSTheme} />
    }

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
            {messages && messages
                .slice(Math.max(messages.length - messagesRenderCount, 0))
                .map((item, index) =>
                    renderMessage(item, index)
                )
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
        <ContextMenu type="message" />
    </div>

})

function useGroupedMessages(messages, messageStartIndex) {
    const cacheRef = useRef(new Map());

    const getGroupedMessages = useCallback((message, index) => {
        if (!message?.groupedId || !message?.id || !messages[messageStartIndex + index + 1]?.groupedId || Number(messages[messageStartIndex + index - 1]?.groupedId) === Number(message.groupedId)) return false;

        const cacheKey = message.id;

        if (cacheRef.current.has(cacheKey)) {
            return cacheRef.current.get(cacheKey);
        }

        let items = [];

        for (let i = 1; i < 10; i++) {
            const item = messages[messageStartIndex + index + i];
            if (item && Number(item.groupedId) === Number(message.groupedId))
                items.push(item);
            else
                break;
        }

        cacheRef.current.set(cacheKey, items);
        return items;
    }, [messageStartIndex, messages]);

    return getGroupedMessages;
}

export default memo(Messages)