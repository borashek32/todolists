import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, appActions} from 'app/app-reducer'
import {handleServerNetworkError} from 'utils/error-utils'
import {AppThunk} from 'app/store';
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { clearTasksAndTodolists } from 'common/actions/common.actions';

const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: "todo",
    initialState: initialState,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            if (index > -1) state.splice(index, 1)
        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType}>) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].title = action.payload.title
        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            const index = state.findIndex(tl => tl.id === action.payload.id)
            state[index].entityStatus = action.payload.status
        },
        setTodolists: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        }
    },
    extraReducers: builder => {
      builder
        .addCase(clearTasksAndTodolists.type, () => {
            return []
        })  
    }
})

export const todolistReducer = slice.reducer
export const todolistActions = slice.actions

// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({status: "loading"}))
        todolistsAPI.getTodolists()
          .then((res) => {
              dispatch(todolistActions.setTodolists({todolists: res.data}))
              dispatch(appActions.setAppStatus({status: "succeeded"}))
          })
          .catch(error => handleServerNetworkError(error, dispatch))
    }
}
export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({status: "loading"}))
        dispatch(todolistActions.changeTodolistEntityStatus({id: todolistId, status: "loading"}))
        todolistsAPI.deleteTodolist(todolistId)
          .then((res) => {
              dispatch(todolistActions.removeTodolist({id: todolistId}))
              dispatch(appActions.setAppStatus({status: "succeeded"}))
          })
    }
}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(appActions.setAppStatus({status: "loading"}))
        todolistsAPI.createTodolist(title)
          .then((res) => {
              dispatch(todolistActions.addTodolist({todolist: res.data.data.item}))
              dispatch(appActions.setAppStatus({status: "succeeded"}))
          })
    }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
          .then((res) => dispatch(todolistActions.changeTodolistTitle({id: id, title: title})))
    }
}

// types
export type AddTodolistActionType = ReturnType<typeof todolistActions.addTodolist>;
export type RemoveTodolistActionType = ReturnType<typeof todolistActions.removeTodolist>;
export type SetTodolistsActionType = ReturnType<typeof todolistActions.setTodolists>;

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}