import { createSlice } from '@reduxjs/toolkit'

export const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        contextMenu: null,
        replyToMessage: null,
        editMessage: null,
        pinnedMessage: [],
        goToMessage: null,
        sendBotCommand: null,
        page: null,
        showPage: false,
        pageTitle: null,
        topbarTitle: null,
        pageHeader: null,
        subPage: [],
        subPageTitle: null,
        userProfile: null,
        activeChat: null,
        activeFullChat: null,
        thread: null,
        call: null,
        showCall: false,
        callLeftPanelClose: false,
        callMinimal: false,
        callMaximized: false,
        voiceOutputVolume: 50,
        mediaPreview: null,
        background: null,
        darkMode: true
    },
    reducers: {
        handleContextMenu: (state, action) => {
            state.contextMenu = action.payload
        },
        handleReplyToMessage: (state, action) => {
            state.replyToMessage = action.payload
        },
        handleEditMessage: (state, action) => {
            state.editMessage = action.payload
        },
        handlePinnedMessage: (state, action) => {
            state.pinnedMessage = action.payload
        },
        handlePinMessage: (state, action) => {
            if (!state.pinnedMessage) {
                state.pinnedMessage = []
            }
            state.pinnedMessage.unshift(action.payload)
        },
        handleUnpinMessage: (state, action) => {
            state.pinnedMessage = state.pinnedMessage.filter(item => item.messageId !== action.payload)
        },
        handleSendBotCommand: (state, action) => {
            state.sendBotCommand = action.payload
        },
        handleGoToMessage: (state, action) => {
            state.goToMessage = action.payload
        },
        handlePage: (state, action) => {
            state.page = action.payload
            state.subPage = []
            state.pageTitle = action.payload
            state.showPage = true
            state.callLeftPanelClose = false
        },
        handleTopbarTitleChange: (state, action) => {
            state.topbarTitle = action.payload
        },
        handlePageClose: (state) => {
            state.page = null
            state.subPage = []
            state.pageTitle = null
            state.showPage = false
        },
        handlePageHeader: (state, action) => {
            state.pageHeader = action.payload
        },
        handlePageAndSubPage: (state, action) => {
            state.page = action.payload.page
            state.subPage = [{ page: action.payload.subPage }]
            state.pageTitle = action.payload.page
            state.showPage = true
            state.callLeftPanelClose = false
            state.subPageTitle = action.payload.subPage
        },
        handleSubPage: (state, action) => {
            state.subPage.push(action.payload)
            state.subPageTitle = action.payload
        },
        handleSubPageClose: (state) => {
            state.subPage.splice(state.subPage.length - 1, 1)
            state.subPageTitle = null
        },
        handleUserProfile: (state, action) => {
            state.userProfile = action.payload
        },
        setActiveChat: (state, action) => {
            state.activeChat = action.payload
            console.log('active chat setted')
        },
        updateActiveChatPermissions: (state, action) => {
            state.activeChat.permissions = action.payload
        },
        setActiveFullChat: (state, action) => {
            state.activeFullChat = action.payload
        },
        handleThread: (state, action) => {
            state.thread = action.payload
        },
        handleCall: (state, action) => {
            if (action.payload) {
                state.showCall = true
            }
            state.call = action.payload
        },
        handleCloseCall: (state) => {
            state.showCall = false
            state.callLeftPanelClose = false
        },
        handleCallLeftPanelToggle: (state) => {
            state.callLeftPanelClose = !state.callLeftPanelClose
            state.page = null
            state.subPage = []
            state.pageTitle = null
            state.topbarTitle = null
            state.showPage = false
        },
        handleCallMinimalToggle: (state) => {
            state.callMinimal = !state.callMinimal
            state.callLeftPanelClose = false
        },
        handleCallMaximizedToggle: (state) => {
            state.callMaximized = !state.callMaximized
        },
        handleVoiceOutputVolume: (state, action) => {
            state.voiceOutputVolume = action.payload
        },
        handleMediaPreview: (state, action) => {
            state.mediaPreview = action.payload
            state.mediaPreview.active = true;
        },
        handleMediaPreviewClose: (state) => {
            state.mediaPreview.active = false;
        },
        handleBackground: (state, action) => {
            state.background = action.payload
        },
        handleToggleDarkMode: (state) => {
            state.darkMode = !state.darkMode
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    handleContextMenu,
    handleReplyToMessage,
    handleEditMessage,
    handlePinnedMessage,
    handlePinMessage,
    handleUnpinMessage,
    handleSendBotCommand,
    handleGoToMessage,
    handlePage,
    handlePageClose,
    handleTopbarTitleChange,
    handlePageHeader,
    handleSubPage,
    handleSubPageClose,
    handlePageAndSubPage,
    handleUserProfile,
    setActiveChat,
    updateActiveChatPermissions,
    setActiveFullChat,
    handleThread,
    handleCall,
    handleCloseCall,
    handleCallLeftPanelToggle,
    handleCallMinimalToggle,
    handleCallMaximizedToggle,
    handleVoiceOutputVolume,
    handleMediaPreview,
    handleMediaPreviewClose,
    handleBackground,
    handleToggleDarkMode
} = uiSlice.actions

export default uiSlice.reducer