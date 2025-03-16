import { memo, useContext, useEffect } from "react"
import { setMessages, updateMessageSeen, updateMessageText } from "../../Stores/Messages"
import { updateLastMessage } from "../../Stores/Chats"
import { useDispatch, useSelector } from "react-redux"
import { socket } from "../../../App"
import { UserContext } from "../../Auth/Auth"

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

    useEffect(() => {
        const updateMessage = (data) => {
            if (data.data) {
                data = data.data
            }
            // if (User._id && User._id !== data.fromId) {
            // let message = messages[messages.indexOf(data)]
            // const updatedMessages = [...messages]
            // let message = updatedMessages.find(x => x._id === data._id);
            // message.message = data.message;
            // message.edited = true;
            dispatch(updateMessageText({ _id: data._id, chatId: data.chatId, message: data.message }))
            if (chats[data.chatId].lastMessage._id === data._id) {
                dispatch(updateLastMessage({ _id: data.chatId, message: { ...chats[data.chatId].lastMessage, message: data.message } }))
            } else {
            }
            // }
        }
        socket.on('UpdateMessage', updateMessage)
        return () => socket.off('UpdateMessage', updateMessage);
    }, [messages, chats]) // UpdateMessage

    useEffect(() => {
        const deleteMessage = (data) => {
            if (data.data) data = data.data
            if (messages[data.chatId]) {
                dispatch(setMessages({
                    chatId: data.chatId,
                    messages: messages[data.chatId].filter(x =>
                        x._id !== data._id
                    )
                }));
            }
            if (chats[data.chatId].lastMessage._id === data._id) {
                dispatch(updateLastMessage({
                    _id: data.chatId, message: {
                        chatId: 1,
                        date: Date.now() / 1000,
                        forwardId: null,
                        from: { id: 2, firstname: "" },
                        fromId: 2,
                        id: Date.now(),
                        message: "Loading...",
                        reply: 0,
                        seen: null,
                        type: "text",
                        messageType: "message",
                    }
                }))
            }
        }
        socket.on('DeleteMessage', deleteMessage)
        return () => socket.off('DeleteMessage', deleteMessage);
    }, [messages, chats]) // DeleteMessage

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