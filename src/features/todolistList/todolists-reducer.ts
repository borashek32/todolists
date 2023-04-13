import {RequestStatusType, appActions} from 'app/app-reducer'
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {createAppAsyncThunk} from "common/utils/create-app-async-thunk";
import {handleServerAppError} from "common/utils/handle-server-app-error";
import {handleServerNetworkError} from "common/utils/handle-server-network-error";
import {todolistsApi, TodolistType, UpdateTodolistTitleArgType} from "features/todolistList/todolists.api";
import {ResultCode} from "common/enums/common.enums";


const initialState: Array<TodolistDomainType> = []

// thunk redux-toolkit
export const removeTodolist = createAppAsyncThunk<{ todolistId: string }, string>
('todolists/remove-todolist', async (todolistId, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsApi.deleteTodolist(todolistId)
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appActions.setAppStatus({status: "succeeded"}))

      return {todolistId}
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const addTodolist = createAppAsyncThunk<{ todolist: TodolistType }, { title: string }>
('todolists/add-todolist', async (arg, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsApi.createTodolist(arg.title)
    if (res.data.resultCode === ResultCode.Success) {
      const todolist = res.data.data.item
      dispatch(appActions.setAppStatus({status: "succeeded"}))

      return {todolist}
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch);
    return rejectWithValue(null)
  }
})

export const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }, void>
('todolists/fetch-todolists', async (_, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsApi.getTodolists()
    dispatch(appActions.setAppStatus({status: "succeeded"}))

    return {todolists: res.data}
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const changeTodolistTitle = createAppAsyncThunk<UpdateTodolistTitleArgType, UpdateTodolistTitleArgType>
('todolists/change-todolist-title', async (arg, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsApi.updateTodolist(arg)
    if (res.data.resultCode === ResultCode.Success) {
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch (e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})


const slice = createSlice({
  name: "todo",
  initialState: initialState,
  reducers: {
    changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].filter = action.payload.filter
    },
    changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
      const index = state.findIndex(tl => tl.id === action.payload.id)
      state[index].entityStatus = action.payload.status
    }
  },
  extraReducers: builder => {
    builder
      .addCase(clearTasksAndTodolists.type, () => {
        return []
      })
      .addCase(removeTodolist.fulfilled, (state, action) => {
        const index = state.findIndex(tl => tl.id === action.payload.todolistId)
        if (index > -1) state.splice(index, 1)
      })
      .addCase(addTodolist.fulfilled, (state, action) => {
        state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
      })
      .addCase(fetchTodolists.fulfilled, (state, action) => {
        return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
      })
      .addCase(changeTodolistTitle.fulfilled, (state, action) => {
        const index = state.findIndex(tl => tl.id === action.payload.todolistId)
        state[index].title = action.payload.title
      })
  }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunks = {removeTodolist, addTodolist, fetchTodolists, changeTodolistTitle}

export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}