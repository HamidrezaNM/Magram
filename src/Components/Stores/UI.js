import { createSlice } from '@reduxjs/toolkit'

export const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        contextMenu: null,
        replyToMessage: null,
        editMessage: null,
        forwardMessage: null,
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
        groupCall: null,
        userMedia: {
            stream: null,
            audioDeviceIndex: 0,
        },
        deleteEffect: null,
        voiceOutputVolume: 50,
        mediaPreview: null,
        stories: [],
        storyModal: null,
        musicPlayer: {
            data: {},
            chatId: null,
            activeMessage: null,
            playing: false,
            active: false
        },
        // musicPlayer: {
        //     data: [{
        //         messageId,
        //         document,
        //     }]
        //     queue: [
        //         ...messageIds
        //     ],
        //     currentIndex: 0,
        //     chatId: 0,
        //     activeMessage: 0,
        //     playing: true,
        // },
        toasts: [],
        dialogs: [],
        background: null
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
        handleForwardMessage: (state, action) => {
            state.forwardMessage = action.payload
        },
        handleForwardMessageChat: (state, action) => {
            state.forwardMessage = { ...state.forwardMessage, chat: action.payload }
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
            if (action.payload?.whenNeeded) {
                if (Number(action.payload.data?.id) !== Number(state.activeChat?.id)) {
                    state.activeChat = action.payload.data
                } else {
                    console.log('chat already set')
                }
            } else {
                state.activeChat = action.payload

                if (Number(action.payload?.entity?.id) !== Number(state.activeFullChat?.id)) {
                    state.activeFullChat = undefined
                }
            }
        },
        updateActiveChatDefaultBannedRights: (state, action) => {
            state.activeChat = {
                ...state.activeChat,
                entity: {
                    ...state.activeChat.entity,
                    defaultBannedRights: {
                        ...state.activeChat.entity.defaultBannedRights,
                        ...action.payload
                    }
                }
            }
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
        handleGroupCall: (state, action) => {
            state.groupCall = action.payload
        },
        handleGroupCallJoined: (state, action) => {
            state.groupCall = {
                ...state.groupCall,
                connection: action.payload.connection,
                joined: true,
                active: true
            }
        },
        handleGroupCallLeft: (state, action) => {
            state.groupCall = {
                ...state.groupCall,
                connection: null,
                joined: false,
                active: false
            }
        },
        handleGroupCallActive: (state, action) => {
            state.groupCall = { ...state.groupCall, active: action.payload }
        },
        handleGroupCallParticipants: (state, action) => {
            if (state.groupCall?.participants) {
                action.payload.forEach((newP) => {
                    const existingIndex = state.groupCall.participants.findIndex(
                        (p) => Number(p.peer.userId) === Number(newP.peer.userId)
                    );

                    if (existingIndex !== -1) {
                        state.groupCall.participants[existingIndex] = { ...state.groupCall.participants[existingIndex], ...newP };
                    } else {
                        state.groupCall = { ...state.groupCall, participants: [...state.groupCall.participants, newP] }
                    }
                });
            }
        },
        handleUserMediaStream: (state, action) => {
            state.userMedia = { ...state.userMedia, stream: action.payload }
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
        handleStories: (state, action) => {
            state.stories = action.payload
        },
        handleStoryModal: (state, action) => {
            state.storyModal = action.payload
        },
        handleMusicPlayer: (state, action) => {
            const { messageId, chatId, document } = action.payload
            const _musicPlayer = state.musicPlayer || {}
            const _data = state.musicPlayer?.data || {}

            state.musicPlayer = {
                ..._musicPlayer,
                data: _data,
                chatId,
                activeMessage: messageId,
                playing: true,
                active: true
            }

            state.musicPlayer.data[messageId] = document
        },
        handleMusicPlayerTogglePlaying: (state, action) => {
            if (action.payload !== undefined)
                state.musicPlayer.playing = action.payload
            else
                state.musicPlayer.playing = !state.musicPlayer.playing
        },
        handleToast: (state, action) => {
            state.toasts.push({ icon: action.payload.icon, profile: action.payload.profile, title: action.payload.title })
        },
        handleDialog: (state, action) => {
            state.dialogs.push(action.payload)
        },
        handleBackground: (state, action) => {
            state.background = action.payload
        },
        handleDeleteMessageEffect: (state, action) => {
            state.deleteEffect = action.payload
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    handleContextMenu,
    handleReplyToMessage,
    handleEditMessage,
    handleForwardMessage,
    handleForwardMessageChat,
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
    updateActiveChatDefaultBannedRights,
    setActiveFullChat,
    handleThread,
    handleCall,
    handleCloseCall,
    handleCallLeftPanelToggle,
    handleCallMinimalToggle,
    handleCallMaximizedToggle,
    handleGroupCall,
    handleGroupCallJoined,
    handleGroupCallLeft,
    handleGroupCallActive,
    handleGroupCallParticipants,
    handleUserMediaStream,
    handleVoiceOutputVolume,
    handleMediaPreview,
    handleMediaPreviewClose,
    handleStories,
    handleStoryModal,
    handleMusicPlayer,
    handleMusicPlayerTogglePlaying,
    handleToast,
    handleDialog,
    handleBackground,
    handleDeleteMessageEffect
} = uiSlice.actions

export default uiSlice.reducer