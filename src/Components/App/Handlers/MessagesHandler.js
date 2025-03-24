import { memo, useContext, useEffect } from "react"
import { removeMessage, removeMessages, setMessages, updateMessage, updateMessageSeen, updateMessageText } from "../../Stores/Messages"
import { updateLastMessage } from "../../Stores/Chats"
import { useDispatch, useSelector } from "react-redux"
import { client, socket } from "../../../App"
import { UserContext } from "../../Auth/Auth"
import { DeletedMessage } from "telegram/events/DeletedMessage"
import { getChatIdFromPeer } from "../../Helpers/chats"
import { Api } from "telegram"

function MessagesHandler() {
    const chats = useSelector((state) => state.chats.value)
    const messages = useSelector((state) => state.messages.value)

    const User = useContext(UserContext)

    const dispatch = useDispatch()

    const beforeunload = () => {
        try {
            localStorage.setItem('chats', JSON.stringify(chats))
            localStorage.setItem('messages', JSON.stringify(messages))
        } catch (error) {
            alert(error)
        }
        alert('data saved')
    }

    useEffect(() => {
        window.addEventListener("beforeunload", beforeunload);
        return () => window.removeEventListener("beforeunload", beforeunload);
    }, [chats, messages])

    const onUpdate = (update) => {
        switch (update.className) {
            case 'UpdateEditMessage':
            case 'UpdateEditChannelMessage':
                updateEditMessage(update.message)
                break;
            case 'UpdateDeleteChannelMessages':
            case 'UpdateDeleteMessages':
                onDeleteMessage(update)
            default:
                break;
        }
    }

    const updateEditMessage = (data) => {
        dispatch(updateMessage({ id: data.id, chatId: data.chatId?.value, message: data }))
        if (chats[data.chatId?.value].message.id === data.id) {
            dispatch(updateLastMessage({ id: data.chatId?.value, message: { ...chats[data.chatId?.value].message, message: data.message } }))
        }
    }

    useEffect(() => {
        client.addEventHandler(onUpdate);
        return () => {
            client.removeEventHandler(onUpdate)
        }
    }, [messages, chats]) // UpdateMessage

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

    const handleUpdateMessageSeen = (to) => {
        dispatch(updateMessageSeen({ _id: to._id, chatId: to.chatId, fromId: to.userId }))
        if (to._id === chats[to.chatId].lastMessage._id) {
            if (chats[to.chatId].lastMessage.seen && chats[to.chatId].lastMessage.seen?.indexOf(to.userId) === -1)
                dispatch(updateLastMessage({ _id: to.chatId, message: { ...chats[to.chatId].lastMessage, seen: [...chats[to.chatId].lastMessage.seen, to.userId] } }))
        }
    }

    useEffect(() => {
        socket.on('UpdateMessageSeen', handleUpdateMessageSeen)
        return () => socket.off('UpdateMessageSeen', handleUpdateMessageSeen)
    }, [User, chats]) // UpdateMessageSeen

    return;
}

export default memo(MessagesHandler)