import {
  AddTaskArgType,
  RemoveTaskArgType,
  TaskPriorities,
  TaskStatuses,
  TaskType,
  todolistsAPI, UpdateTaskArgType,
  UpdateTaskModelType
} from 'api/todolists-api'
import {appActions} from 'app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {createSlice} from "@reduxjs/toolkit";
import {todolistsThunks} from "./todolists-reducer";
import { clearTasksAndTodolists } from 'common/actions/common.actions'
import { createAppAsyncThunk } from 'utils/create-app-async-thunk'


// redux-toolkit thunks
export const fetchTasks = createAppAsyncThunk<{tasks: TaskType[], todolistId: string}, string>
("tasks/fetch-tasks", async (todolistId: string, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsAPI.getTasks(todolistId)
    const tasks = res.data.items
    dispatch(appActions.setAppStatus({status: "succeeded"}))
    
    return {todolistId, tasks}

  } catch(e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const addTask = createAppAsyncThunk<{task: TaskType}, AddTaskArgType>
("tasks/add-task", async (arg, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsAPI.createTask(arg)
    if (res.data.resultCode === 0) {
      const task = res.data.data.item
      dispatch(appActions.setAppStatus({status: "succeeded"}))

      return {task}
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch(e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const removeTask = createAppAsyncThunk<RemoveTaskArgType, RemoveTaskArgType>
('tasks/remove-task', async (arg, thunkApi) => {
  const {dispatch, rejectWithValue} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const res = await todolistsAPI.deleteTask(arg)
    if (res.data.resultCode === 0) {
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }

  } catch(e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})

export const updateTask = createAppAsyncThunk<UpdateTaskArgType, UpdateTaskArgType >
('tasks/update-task', async (arg, thunkApi) => {
  const {dispatch, rejectWithValue, getState} = thunkApi
  try {
    dispatch(appActions.setAppStatus({status: "loading"}))
    const task = getState().tasks[arg.todolistId].find(t => t.id === arg.taskId)

    if (!task) {
      // TODO
      console.warn('task not found in the state')
      return rejectWithValue(null)
    }

    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...arg.domainModel
    }

    const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel)
    if (res.data.resultCode === 0) {
      dispatch(appActions.setAppStatus({status: 'succeeded'}))
      return arg
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null)
    }
  } catch(e) {
    handleServerNetworkError(e, dispatch)
    return rejectWithValue(null)
  }
})



const initialState: TasksStateType = {}

const slice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state[action.payload.todolistId] = action.payload.tasks
      })
      // нужно для обработаки ошибок
      // но у нас ошибки обрабатываются по другому
      // .addCase(fetchTasks.rejected, (state, action) => {})
      .addCase(addTask.fulfilled, (state, action) => {
        state[action.payload.task.todoListId].unshift(action.payload.task)
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        const tasks = state[action.payload.todolistId]
        const index = tasks.findIndex(t => t.id === action.payload.taskId)
        if (index > -1) tasks.splice(index, 1)
      })
      .addCase(updateTask.fulfilled, (state, action) => {
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex(t => t.id === action.payload.taskId)
          if (index > -1) tasks[index] = {...tasks[index], ...action.payload.domainModel}
      })
      .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
        delete state[action.payload.todolistId]
      })
      .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
        action.payload.todolists.forEach((tl) => state[tl.id] = [])
      })
      .addCase(clearTasksAndTodolists.type, (state, action) => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = {fetchTasks, addTask, removeTask, updateTask}

// types
export type UpdateDomainTaskModelType = {
  title?: string
  description?: string
  status?: TaskStatuses
  priority?: TaskPriorities
  startDate?: string
  deadline?: string
}
export type TasksStateType = {
  [key: string]: Array<TaskType>
}
