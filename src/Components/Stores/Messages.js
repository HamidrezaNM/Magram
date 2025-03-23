import { createSlice } from '@reduxjs/toolkit'

export const messagesSlice = createSlice({
    name: 'messages',
    initialState: {
        value: {
            1: [{
                chatId: 1,
                date: Date.now() / 1000,
                forwardId: null,
                from: { id: 2, firstname: "test" },
                fromId: 2,
                id: Date.now(),
                message: "test message",
                reply: 0,
                seen: null,
                type: "text",
                messageType: "message",
            }],
        },
    },
    reducers: {
        messageAdded: (state, action) => {
            if (state.value[action.payload.chatId]) {
                state.value[action.payload.chatId].push(action.payload)
            } else {
                state.value[action.payload.chatId] = [action.payload]
            }
        },
        handleCachedMessages: (state, action) => {
            state.value = action.payload
        },
        setMessages: (state, action) => {
            if (action.payload.messages?.length) {
                if (state.value[action.payload.chatId]?.length > 0) {
                    state.value[action.payload.chatId] = [...state.value[action.payload.chatId], ...action.payload.messages]
                } else
                    state.value[action.payload.chatId] = action.payload.messages
            }
        },
        unshiftMessages: (state, action) => {
            if (action.payload.messages?.length) {
                if (state.value[action.payload.chatId]?.length > 0) {
                    state.value[action.payload.chatId] = [...action.payload.messages, ...state.value[action.payload.chatId]]
                } else
                    state.value[action.payload.chatId] = action.payload.messages
            }
        },
        removeMessage: (state, action) => {
            if (state.value[action.payload.chatId]) {
                state.value[action.payload.chatId] = state.value[action.payload.chatId].filter(x =>
                    x.id != action.payload.messageId
                )
            }
        },
        removeMessages: (state, action) => {
            if (state.value[action.payload.chatId]) {
                state.value[action.payload.chatId] = state.value[action.payload.chatId].filter(x =>
                    !action.payload.messages.includes(x.id)
                )
            }
        },
        updateMessageId: (state, action) => {
            const message = state.value[action.payload.chatId].find(message => message.id === action.payload.messageId)
            if (message) {
                // message = { ...message, id: action.payload.id }
                message.id = action.payload.id
                message.seen = []
            }
        },
        handleMessageError: (state, action) => {
            const message = state.value[action.payload.chatId].find(message => message.id == action.payload.messageId)
            if (message)
                message = { ...message, seen: -1 }
        },
        updateMessage: (state, action) => {
            if (state.value[action.payload.chatId]) {
                let messageIndex = state.value[action.payload.chatId].findIndex(message => message.id === action.payload.id)
                if (messageIndex)
                    state.value[action.payload.chatId][messageIndex] = { ...action.payload.message }
            }
        },
        updateMessageSeen: (state, action) => {
            if (state.value[action.payload.chatId]) {
                state.value[action.payload.chatId].forEach(item => {
                    if (item._id <= action.payload._id && item.fromId != action.payload.fromId) {
                        if (item.seen == 0)
                            item.seen = [action.payload.fromId]
                        else if (item.seen)
                            item.seen.push(action.payload.fromId)
                    }
                })
            }
        },
        updateMessageMediaUploadProgress: (state, action) => {
            const message = state.value[action.payload.chatId].find(message => message.id === action.payload.id)
            if (message) {
                message.progress = action.payload.progress
            }
        },
        updateMessageMedia: (state, action) => {
            const message = state.value[action.payload.chatId].find(message => message.id === action.payload.id)
            if (message) {
                message.media = action.payload.media
                delete message.progress
                delete message.isUploading
            }
        },
    },
})

// Action creators are generated for each case reducer function
export const { messageAdded, handleCachedMessages, setMessages, unshiftMessages, removeMessage, removeMessages, updateMessageId, updateMessage, updateMessageSeen, handleMessageError, updateMessageMediaUploadProgress, updateMessageMedia } = messagesSlice.actions

export default messagesSlice.reducer