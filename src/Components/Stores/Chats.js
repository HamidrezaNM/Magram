import { createSlice } from '@reduxjs/toolkit'

export const chatsSlice = createSlice({
    name: 'chats',
    initialState: {
        value: {},
    },
    reducers: {
        chatAdded: (state, action) => {
            state.value[action.payload.id.value] = { ...action.payload }
        },
        handleCachedChats: (state, action) => {
            state.value = action.payload
        },
        setChats: (state, action) => {
            state.value = {}
            action.payload.forEach(item => {
                if (item.type === 'private' && !item.permissions)
                    item.permissions =
                    {
                        sendText: true,
                        sendMedia: true,
                        pinMessages: true
                    }
                state.value[item.id.value] = item
            })
        },
        setChat: (state, action) => {
            if (state.value[action.payload._id]) {
                Object.keys(action.payload).map(x => {
                    state.value[action.payload._id][x] = action.payload[x]
                })
            } else {
                state.value[action.payload._id] = action.payload
            }
        },
        removeChat: (state, action) => {
            if (state.value[action.payload]) {
                state.value = Object.values(state.value).filter(x =>
                    x.id.value !== action.payload
                )
            }
        },
        setFullChat: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                chat.fullChat = action.payload.fullChat
            }
        },
        updateChatParticipants: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, participants: action.payload.participants }
            }
        },
        updateChatRead: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                state.value[action.payload.chatId] = { ...chat, dialog: { ...chat.dialog, readOutboxMaxId: action.payload.maxId } }
            }
        },
        updateLastMessage: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, message: action.payload.message, unreadCount: action.payload.unread ? chat.unreadCount + 1 : 0 }
            }
        },
        updateChatUnreadCount: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, unreadCount: action.payload.count }
            }
        },
        updateChatUserStatus: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, entity: { ...chat.entity, status: action.payload.status } }
            }
        },
        updateTypingStatus: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                chat.typingStatus = action.payload.typingStatus
            }
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    chatAdded,
    handleCachedChats,
    setChats,
    setChat,
    removeChat,
    setFullChat,
    updateChatParticipants,
    updateChatRead,
    updateLastMessage,
    updateChatUnreadCount,
    updateChatUserStatus,
    updateTypingStatus
} = chatsSlice.actions

export default chatsSlice.reducer