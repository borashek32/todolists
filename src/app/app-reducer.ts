import {Dispatch} from 'redux'
import {authActions} from 'features/auth/auth.reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {authAPI} from "features/auth/auth.api";

const appInitialState = {
  status: 'idle' as RequestStatusType,
  error: null as string | null,
  isInitialized: false
}

const slice = createSlice({
  name: "app",
  initialState: appInitialState,
  reducers: {
    setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
      state.error = action.payload.error
    },
    setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
      state.status = action.payload.status
    },
    setAppInitialized: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
      state.isInitialized = action.payload.isInitialized
    }
  }
})

export const appReducer = slice.reducer
export const appActions = slice.actions

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type AppInitialStateType = typeof appInitialState

export const initializeAppTC = () => (dispatch: Dispatch) => {
  authAPI.me().then(res => {
    if (res.data.resultCode === 0) dispatch(authActions.setIsLoggedIn({isLoggedIn: true}))
    dispatch(appActions.setAppInitialized({isInitialized: true}));
  })
}

export type SetAppErrorActionType = ReturnType<typeof appActions.setAppError>
export type SetAppStatusActionType = ReturnType<typeof appActions.setAppStatus>
