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
        updateChatDefaultBannedRights: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, entity: { ...chat.entity, defaultBannedRights: { ...chat.entity.defaultBannedRights, ...action.payload.bannedRights } } }
            }
        },
        updateChatParticipantAdmin: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = {
                    ...chat,
                    participants: chat.participants.map(item => {
                        if (Number(item.id) !== action.payload.userId) return item;

                        return {
                            ...item,
                            participant: {
                                ...item.participant,
                                adminRights: action.payload.adminRights,
                            },
                        };
                    }),
                }
            }

            console.log(state.value[action.payload.id])
        },
        updateChatRead: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                state.value[action.payload.chatId] = { ...chat, dialog: { ...chat.dialog, readOutboxMaxId: action.payload.maxId }, unreadCount: action.payload.unreadCount ?? chat.unreadCount }
            }
        },
        updateLastMessage: (state, action) => {
            const chat = state.value[action.payload.id]
            if (chat) {
                state.value[action.payload.id] = { ...chat, message: action.payload.message, unreadCount: action.payload.unread ? chat.unreadCount + 1 : chat.unreadCount }
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
        handleTypingStatus: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                if (chat.typing)
                    state.value[action.payload.chatId].typing = [...state.value[action.payload.chatId].typing, action.payload.typing]
                else
                    state.value[action.payload.chatId].typing = [action.payload.typing]
            }
        },
        removeTypingStatus: (state, action) => {
            const chat = state.value[action.payload.chatId]
            if (chat) {
                if (chat.typing)
                    state.value[action.payload.chatId].typing = state.value[action.payload.chatId].typing.filter(item => item !== action.payload.typing)
                else
                    state.value[action.payload.chatId].typing = [action.payload.typing]
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
    updateChatDefaultBannedRights,
    updateChatParticipantAdmin,
    updateChatRead,
    updateLastMessage,
    updateChatUnreadCount,
    updateChatUserStatus,
    handleTypingStatus,
    removeTypingStatus
} = chatsSlice.actions

export default chatsSlice.reducer