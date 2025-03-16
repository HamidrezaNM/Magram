import { createSlice } from '@reduxjs/toolkit'

export const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        value: {
            contextMenu: null,
            replyToMessage: null,
            editMessage: null,
            pinnedMessage: [],
            goToMessage: null,
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
    },
    reducers: {
        handleContextMenu: (state, action) => {
            state.value.contextMenu = action.payload
        },
        handleReplyToMessage: (state, action) => {
            state.value.replyToMessage = action.payload
        },
        handleEditMessage: (state, action) => {
            state.value.editMessage = action.payload
        },
        handlePinnedMessage: (state, action) => {
            state.value.pinnedMessage = action.payload
        },
        handlePinMessage: (state, action) => {
            if (!state.value.pinnedMessage) {
                state.value.pinnedMessage = []
            }
            state.value.pinnedMessage.unshift(action.payload)
        },
        handleUnpinMessage: (state, action) => {
            state.value.pinnedMessage = state.value.pinnedMessage.filter(item => item.messageId !== action.payload)
        },
        handleGoToMessage: (state, action) => {
            state.value.goToMessage = action.payload
        },
        handlePage: (state, action) => {
            state.value.page = action.payload
            state.value.subPage = []
            state.value.pageTitle = action.payload
            state.value.showPage = true
            state.value.callLeftPanelClose = false
        },
        handleTopbarTitleChange: (state, action) => {
            state.value.topbarTitle = action.payload
        },
        handlePageClose: (state) => {
            state.value.page = null
            state.value.subPage = []
            state.value.pageTitle = null
            state.value.showPage = false
        },
        handlePageHeader: (state, action) => {
            state.value.pageHeader = action.payload
        },
        handlePageAndSubPage: (state, action) => {
            state.value.page = action.payload.page
            state.value.subPage = [{ page: action.payload.subPage }]
            state.value.pageTitle = action.payload.page
            state.value.showPage = true
            state.value.callLeftPanelClose = false
            state.value.subPageTitle = action.payload.subPage
        },
        handleSubPage: (state, action) => {
            state.value.subPage.push(action.payload)
            state.value.subPageTitle = action.payload
        },
        handleSubPageClose: (state) => {
            state.value.subPage.splice(state.value.subPage.length - 1, 1)
            state.value.subPageTitle = null
        },
        handleUserProfile: (state, action) => {
            state.value.userProfile = action.payload
        },
        setActiveChat: (state, action) => {
            state.value.activeChat = action.payload
            console.log('active chat setted')
        },
        updateActiveChatPermissions: (state, action) => {
            state.value.activeChat.permissions = action.payload
        },
        setActiveFullChat: (state, action) => {
            state.value.activeFullChat = action.payload
        },
        handleCall: (state, action) => {
            if (action.payload) {
                state.value.showCall = true
            }
            state.value.call = action.payload
        },
        handleCloseCall: (state) => {
            state.value.showCall = false
            state.value.callLeftPanelClose = false
        },
        handleCallLeftPanelToggle: (state) => {
            state.value.callLeftPanelClose = !state.value.callLeftPanelClose
            state.value.page = null
            state.value.subPage = []
            state.value.pageTitle = null
            state.value.topbarTitle = null
            state.value.showPage = false
        },
        handleCallMinimalToggle: (state) => {
            state.value.callMinimal = !state.value.callMinimal
            state.value.callLeftPanelClose = false
        },
        handleCallMaximizedToggle: (state) => {
            state.value.callMaximized = !state.value.callMaximized
        },
        handleVoiceOutputVolume: (state, action) => {
            state.value.voiceOutputVolume = action.payload
        },
        handleMediaPreview: (state, action) => {
            state.value.mediaPreview = action.payload
            state.value.mediaPreview.active = true;
        },
        handleMediaPreviewClose: (state) => {
            state.value.mediaPreview.active = false;
        },
        handleBackground: (state, action) => {
            state.value.background = action.payload
        },
        handleToggleDarkMode: (state) => {
            state.value.darkMode = !state.value.darkMode
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