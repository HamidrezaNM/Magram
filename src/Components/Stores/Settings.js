import { createSlice } from '@reduxjs/toolkit'

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        topPeers: { users: [] },
        playerVolume: 1,
        animations: {
            AnimatedStickers: false,
            ChatAnimations: true,
            AutoPlayGIFs: true,
        },
        customTheme: {
            centerTopBar: true,
            bottomBar: true,
            iOSTheme: true,
            gradientMessage: true,
            noBlur: false,
            newSidebar: true,
            gradientCanvas: true,
            primaryColor: null
        },
        darkMode: undefined
    },
    reducers: {
        handlePlayerVolume: (state, action) => {
            state.playerVolume = action.payload
        },
        handleAnimationsOptions: (state, action) => {
            state.animations = { ...state.animations, ...action.payload }
        },
        handleCustomTheme: (state, action) => {
            state.customTheme = { ...state.customTheme, ...action.payload }
        },
        handleToggleDarkMode: (state) => {
            state.darkMode = !state.darkMode
        },
        handleTopPeers: (state, action) => {
            const date = Date.now()

            state.topPeers = { users: action.payload, date }
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    handlePlayerVolume,
    handleAnimationsOptions,
    handleCustomTheme,
    handleToggleDarkMode,
    handleTopPeers
} = settingsSlice.actions

export default settingsSlice.reducer