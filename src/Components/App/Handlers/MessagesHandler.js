import { forwardRef, memo, useContext, useEffect, useImperativeHandle } from "react"
import { messageAdded, removeMessage, removeMessages, setMessages, updateMessage, updateMessageSeen, updateMessageText } from "../../Stores/Messages"
import { chatAdded, updateLastMessage } from "../../Stores/Chats"
import { useDispatch, useSelector } from "react-redux"
import { UserContext } from "../../Auth/Auth"
import { getChatIdFromPeer } from "../../Helpers/chats"
import { Api } from "telegram"
import { readHistory } from "../../Util/messages"

const MessagesHandler = forwardRef(({ }, ref) => {
    const chats = useSelector((state) => state.chats.value)
    const messages = useSelector((state) => state.messages.value)
    const activeChat = useSelector((state) => state.ui.activeChat)
    const thread = useSelector((state) => state.ui.thread)

    const User = useContext(UserContext);

    const dispatch = useDispatch()

    // const beforeunload = () => {
    //     try {
    //         localStorage.setItem('chats', JSON.stringify(chats))
    //         localStorage.setItem('messages', JSON.stringify(messages))
    //     } catch (error) {
    //         alert(error)
    //     }
    //     alert('data saved')
    // }

    // useEffect(() => {
    //     window.addEventListener("beforeunload", beforeunload);
    //     return () => window.removeEventListener("beforeunload", beforeunload);
    // }, [chats, messages])

    useImperativeHandle(
        ref,
        () => ({
            onUpdate(update) {
                switch (update.type) {
                    case 'UpdateEditMessage':
                    case 'UpdateEditChannelMessage':
                        updateEditMessage(update.message)
                        break;
                    case 'UpdateDeleteChannelMessages':
                    case 'UpdateDeleteMessages':
                        onDeleteMessage(update)
                        break;
                    case 'NewMessage':
                        console.log(update)
                        onNewMessage(update.message)
                        break;
                    default:
                        break;
                }
            }
        }),
        [chats, messages],
    )

    const onNewMessage = async (message) => {
        const chatId = message.chatId

        message._sender = await message.getSender()

        if (chatId && !chats[chatId]) {
            await message.getChat()

            if (message.chat && !message.chat.left) {
                const chat = {
                    id: { value: chatId },
                    entity: message.chat,
                    message,
                    title: message.chat.title ?? message.chat.firstName,
                    date: message.date,
                    isChannel: message.isChannel,
                    isGroup: message.isGroup,
                    isUser: message.isPrivate
                }

                dispatch(chatAdded(chat))
            }
        }

        // if (!User._id || User._id === message.fromId && message.type !== 'call') return
        dispatch(messageAdded(message));
        if (thread && (thread.id === message.replyTo?.replyToMsgId || thread.id === message.replyTo?.replyToTopId)) {
            console.log('new comment')
            dispatch(messageAdded({ ...message, chatId: thread.chatId?.value + '_' + thread.id }));
        }
        dispatch(updateLastMessage({ id: chatId, message, unread: User.id.value !== message._senderId.value }))
        if (chatId == activeChat?.id.value)
            readHistory(activeChat.id.value, dispatch)
        else if (!message.chat?.left && !chats[message.chat?.id?.value]?.dialog?.notifySettings?.muteUntil) {
            // if (!isWindowFocused.current)
            //     notify(chats[chatId]?.title ?? message.chat?.title ?? message.chat?.firstName, {
            //         body: (message._sender?.firstName + ': ') + message.text
            //     })
        }
    }

    const updateEditMessage = (data) => {
        dispatch(updateMessage({ id: data.id, chatId: data.chatId?.value, message: data }))
        if (chats[data.chatId?.value].message.id === data.id) {
            dispatch(updateLastMessage({ id: data.chatId?.value, message: { ...chats[data.chatId?.value].message, message: data.message } }))
        }
    }

    const onDeleteMessage = async (data) => {
        let chatId = data.channelId && getChatIdFromPeer(new Api.PeerChannel({ channelId: data.channelId }))

        const updateChatLastMessage = (messageId) => {
            if (chatId && chats[chatId].message?.id === messageId) {
                const chatMessages = messages[chatId]
                dispatch(updateLastMessage({
                    id: chatId, message: chatMessages.length > 2 ? chatMessages[chatMessages.length - 2] : null
                }))
            }
        }

        if (!chatId)
            Object.keys(messages).forEach(chat => {
                var message = messages[chat].find(x => data.messages.includes(x.id))

                if (message) {
                    chatId = chat
                    updateChatLastMessage(message.id)
                }
            })
        else
            updateChatLastMessage(data.messages[0])

        dispatch(removeMessages({ chatId, messages: data.messages }))
    }

    return;
})

export default memo(MessagesHandler)