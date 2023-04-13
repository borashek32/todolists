import {tasksReducer} from 'features/todolistList/tasks-reducer';
import {todolistsReducer} from 'features/todolistList/todolists-reducer';
import { AnyAction, combineReducers } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import {appReducer} from './app-reducer'
import {authReducer} from 'features/auth/auth.reducer'
import {configureStore} from "@reduxjs/toolkit";


const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})

export const store = configureStore({
    reducer: rootReducer,
    // если используется один слой middleware, то можно тут его не перечислять
    // когда появляется еще слой каких-то middlewares, то нужно прописывать здесь их все
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(thunkMiddleware)
})

export type AppRootStateType = ReturnType<typeof rootReducer>

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, AnyAction>

export type AppDispatch = ThunkDispatch<AppRootStateType, unknown, AnyAction>

// @ts-ignore
window.store = store;
