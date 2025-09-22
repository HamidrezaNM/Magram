import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit'
import messagesReducer from './Messages'
import uiReducer from './UI'
import chatsReducer from './Chats'
import settingsReducer, { handleAnimationsOptions, handleCustomTheme, handlePlayerVolume, handleSearchHistoryAdd, handleToggleDarkMode, handleTopPeers } from './Settings'
import { enableMapSet } from 'immer';

enableMapSet();

const persistedRaw = localStorage.getItem('magramState')
const persistedState = persistedRaw ? JSON.parse(persistedRaw) : {}

const preloadedState = {}

if (persistedState.settings) {
    preloadedState.settings = persistedState.settings
}

const listenerMiddleware = createListenerMiddleware()

const store = configureStore({
    reducer: {
        messages: messagesReducer,
        chats: chatsReducer,
        ui: uiReducer,
        settings: settingsReducer
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }).prepend(listenerMiddleware.middleware)
})

listenerMiddleware.startListening({
    matcher: (action) =>
        action.type === handleCustomTheme.type ||
        action.type === handleAnimationsOptions.type ||
        action.type === handleToggleDarkMode.type ||
        action.type === handlePlayerVolume.type ||
        action.type === handleTopPeers.type ||
        action.type === handleSearchHistoryAdd.type,

    effect: async (action, listenerApi) => {
        const settings = listenerApi.getState().settings

        const resultState = {
            settings
        }

        localStorage.setItem('magramState', JSON.stringify(resultState))
    }
})

export default store