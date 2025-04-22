import { createSlice } from '@reduxjs/toolkit'

export const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        customTheme: {
            centerTopBar: true,
            bottomBar: true,
            iOSTheme: true
        },
        darkMode: undefined
    },
    reducers: {
        handleCustomTheme: (state, action) => {
            state.customTheme = { ...state.customTheme, ...action.payload }
        },
        handleToggleDarkMode: (state) => {
            state.darkMode = !state.darkMode
        }
    },
})

// Action creators are generated for each case reducer function
export const {
    handleCustomTheme,
    handleToggleDarkMode
} = settingsSlice.actions

export default settingsSlice.reducer