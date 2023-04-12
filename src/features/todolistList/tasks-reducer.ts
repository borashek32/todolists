import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from 'app/store'
import {appActions} from 'app/app-reducer'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistActions} from "./todolists-reducer";
import { clearTasksAndTodolists } from 'common/actions/common.actions'


// redux-toolkit thunks

export const fetchTasks = createAsyncThunk("tasks/fetch-tasks", async (todolistId: string, thunkAPI) => {
  const {dispatch} = thunkAPI
  dispatch(appActions.setAppStatus({status: "loading"}))
  todolistsAPI.getTasks(todolistId)
    .then((res) => {
      dispatch(tasksActions.SetTasks({todolistId: todolistId, tasks: res.data.items}))
      dispatch(appActions.setAppStatus({status: "succeeded"}))
    })
})




const initialState: TasksStateType = {}

const slice = createSlice({
  name: "tasks",
  initialState: initialState,
  reducers: {
    removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) tasks.splice(index, 1)
    },
    addTask: (state, action: PayloadAction<TaskType>) => {
      state[action.payload.todoListId].unshift(action.payload)
    },
    updateTask: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
      const tasks = state[action.payload.todolistId]
      const index = tasks.findIndex(t => t.id === action.payload.taskId)
      if (index > -1) tasks[index] = {...tasks[index], ...action.payload.model}
    },
    SetTasks: (state, action: PayloadAction<{ todolistId: string, tasks: TaskType[] }>) => {
      state[action.payload.todolistId] = action.payload.tasks
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(todolistActions.addTodolist, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(todolistActions.removeTodolist, (state, action) => {
        delete state[action.payload.id]
      })
      .addCase(todolistActions.setTodolists, (state, action) => {
        action.payload.todolists.forEach((tl) => state[tl.id] = [])
      })
      .addCase(clearTasksAndTodolists.type, (state, action) => {
        return {}
      })
  }
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions
export const tasksThunks = {fetchTasks}

// thunks

export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
  todolistsAPI.deleteTask(todolistId, taskId)
    .then(res => dispatch(tasksActions.removeTask({taskId: taskId, todolistId: todolistId})))
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
  dispatch(appActions.setAppStatus({status: "loading"}))
  todolistsAPI.createTask(todolistId, title)
    .then(res => {
      if (res.data.resultCode === 0) {
        dispatch(tasksActions.addTask(res.data.data.item))
        dispatch(appActions.setAppStatus({status: "succeeded"}))
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => {
      handleServerNetworkError(error, dispatch)
    })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
  const task = getState().tasks[todolistId].find(t => t.id === taskId)

  if (!task) {
    console.warn('task not found in the state')
    return
  }

  const apiModel: UpdateTaskModelType = {
    deadline: task.deadline,
    description: task.description,
    priority: task.priority,
    startDate: task.startDate,
    title: task.title,
    status: task.status,
    ...domainModel
  }

  todolistsAPI.updateTask(todolistId, taskId, apiModel)
    .then(res => {
      if (res.data.resultCode === 0) {
        const action = tasksActions.updateTask({taskId: taskId, model: apiModel, todolistId: todolistId})
        dispatch(action)
      } else {
        handleServerAppError(res.data, dispatch);
      }
    })
    .catch((error) => handleServerNetworkError(error, dispatch))
}

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
