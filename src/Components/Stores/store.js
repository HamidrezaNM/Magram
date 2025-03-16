import { configureStore } from '@reduxjs/toolkit'
import messagesReducer from './Messages'
import uiReducer from './UI'
import chatsReducer from './Chats'

export default configureStore({
    reducer: {
        messages: messagesReducer,
        chats: chatsReducer,
        ui: uiReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, })
})