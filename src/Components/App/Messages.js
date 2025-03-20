import { forwardRef, memo, useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../Stores/Messages";
import { handleEditMessage, handleGoToMessage, handlePinMessage, handlePinnedMessage } from "../Stores/UI";
import MessagesLoading from "../UI/MessagesLoading";
import { client, socket } from "../../App";
import { AuthContext, UserContext } from "../Auth/Auth";
import { getMessageText } from "./MessageText";
import { goToMessage } from "./Home";
import { Api } from "telegram";
import { readHistory } from "../Util/messages";
import Transition from "./Transition";

const Messages = forwardRef(({ MessagesRef }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [messagesRenderCount, setMessagesRenderCount] = useState(20)

    const Auth = useContext(AuthContext)
    const User = useContext(UserContext)

    const messages = useSelector((state) => state.messages.value)
    const activeChat = useSelector((state) => state.ui.value.activeChat)
    const _goToMessage = useSelector((state) => state.ui.value.goToMessage)

    const dispatch = useDispatch()

    const isLoading = useRef(false)
    const autoScroll = useRef(false);
    const scrollToBottom = document.querySelector('.scrollToBottom')
    const BottomRef = document.querySelector('.bottom')

    const onGetMessages = (data) => {
        // if (response.ok) {
        // socket.emit('UpdateMessageSeen', { token: Auth.authJWT, message: response.data[response.data.length - 1] })
        setIsLoaded(true)
        setTimeout(() => {
            MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight + 3000, behavior: "instant" })
        }, 40)
        if (messages[activeChat.id.value]?.length !== data?.total) {
            MessagesRef.current.classList.add('MessagesAnimating')
            dispatch(setMessages({ chatId: activeChat.id.value, messages: data.reverse() }))
            data?.filter((item) => item.pinned).map((message) => dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(message, User._id), messageId: message._id })))
            requestAnimationFrame(() => {
                MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
            })

            readHistory(activeChat.id.value, dispatch)
        } else {
            messages[activeChat.id.value]?.filter((item) => item.pinned).map((message) => dispatch(handlePinMessage({ title: 'Pinned Message', subtitle: getMessageText(message, User._id), messageId: message.id })))
        }
        // }
    }

    const handleScrollToBottom = () => {
        MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (messages[activeChat?.id?.value]?.length && autoScroll.current) {
            handleScrollToBottom()
        }
    }, [messages[activeChat?.id?.value]?.length]) // Scroll to Bottom on ReceiveMessage and SendMessage

    useEffect(() => {
        (async () => {
            if (activeChat) {
                setIsLoaded(false)
                setMessagesRenderCount(20)
                if (messages[activeChat.id.value]?.length > 0) {
                    isLoading.current = false
                    requestAnimationFrame(() => {
                        MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
                    })
                }
                dispatch(handlePinnedMessage())

                const messagesLength = messages[activeChat.id.value]?.length
                let lastMessageId = null

                if (messagesLength > 0) {
                    lastMessageId = messages[activeChat.id.value][messagesLength - 1]?.id
                }

                const result = await client.getMessages(
                    activeChat.id.value,
                    {
                        limit: 100,
                        minId: lastMessageId
                    }
                );

                if (result.length)
                    onGetMessages(result)
                else {
                    setIsLoaded(true)
                    readHistory(activeChat.id.value, dispatch)
                }

                document.querySelector('.scrollToBottom').style.bottom = document.querySelector('.bottom').clientHeight + 8 + 'px'
            }
        })()
    }, [activeChat?.id]) // Get Messages on activeChat Changed

    const onScrollMessages = () => {
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

            if (messages[activeChat?.id.value]?.length > messagesRenderCount && MessagesRef.current.scrollTop < 1) {
                console.log('message render count increase')
                MessagesRef.current.scroll({ left: 0, top: 1, behavior: "instant" })
                setMessagesRenderCount(messages[activeChat?.id.value]?.length < messagesRenderCount * 2 ? messages[activeChat?.id.value]?.length : messagesRenderCount * 2)
            }
        }
    }

    useEffect(() => {
        if (activeChat && messages[activeChat?.id.value]?.length && isLoading.current) {
            MessagesRef.current.scroll({ left: 0, top: MessagesRef.current.scrollHeight, behavior: "instant" })
            isLoading.current = false
        }

        if (activeChat && messages[activeChat?.id.value]?.length) {
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
    }, [activeChat, messages[activeChat?.id.value], messagesRenderCount]) // Scroll to Bottom on Load

    useEffect(() => {
        if (_goToMessage) {
            const index = messages[activeChat?.id.value].indexOf(messages[activeChat?.id.value].filter((item) => item.id === _goToMessage)[0])

            if (messages[activeChat?.id.value].length - index < messagesRenderCount) {
                goToMessage(_goToMessage)
            } else {
                setMessagesRenderCount(messages[activeChat?.id.value].length - index)
                setTimeout(() => {
                    goToMessage(_goToMessage)
                }, 40);
            }
            dispatch(handleGoToMessage())
        }
    }, [_goToMessage])

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
    }, [handleKeyUp, messages[activeChat._id]]);

    console.log('Messages Rerender')

    return <div className="Messages scrollable" ref={MessagesRef} onScroll={onScrollMessages}>
        {messages[activeChat.id.value] ? <>
            {!isLoaded && <div className="loading">
                {<MessagesLoading />}
            </div>
            }
            {messages[activeChat.id.value].slice(Math.max(messages[activeChat.id.value].length - messagesRenderCount, 0)).map((item, index) => (
                <Message key={activeChat.id?.value + '_' + item?.id} data={item} prevMsgFrom={messages[activeChat.id.value][(messages[activeChat.id.value].length - messagesRenderCount > 0 ? messages[activeChat.id.value].length - messagesRenderCount : 0) + index - 1]?._senderId?.value} prevMsgDate={messages[activeChat.id.value][(messages[activeChat.id.value].length - messagesRenderCount > 0 ? messages[activeChat.id.value].length - messagesRenderCount : 0) + index - 1]?.date} nextMsgFrom={messages[activeChat.id.value][(messages[activeChat.id.value].length - messagesRenderCount > 0 ? messages[activeChat.id.value].length - messagesRenderCount : 0) + index + 1]?._senderId?.value} />
            ))}
        </> :
            (<div className="loading">
                {<MessagesLoading />}
            </div>)}
    </div>

})

export default memo(Messages)