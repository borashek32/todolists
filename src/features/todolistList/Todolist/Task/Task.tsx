import React, {ChangeEvent, useCallback} from 'react'
import {Checkbox, IconButton} from '@mui/material'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Delete} from '@mui/icons-material'
import {TaskStatuses, TaskType} from 'api/todolists-api'
import {removeTaskTC, updateTaskTC} from "features/todolistList/tasks-reducer"
import {useAppDispatch} from "hooks/useAppDispatch"


type TaskPropsType = {
  task: TaskType
  todolistId: string
}

export const Task = React.memo((props: TaskPropsType) => {

  const dispatch = useAppDispatch()

  const removeTask = useCallback(() => {
    dispatch(removeTaskTC(props.task.id, props.todolistId))
  }, [dispatch, props.task.id, props.todolistId])

  const changeTaskTitle = useCallback((newTitle: string) => {
    dispatch(updateTaskTC(props.task.id, {title: newTitle}, props.todolistId))
  }, [dispatch, props.task.id, props.todolistId])

  const changeStatus = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let status: TaskStatuses
    e.currentTarget.checked ? status = TaskStatuses.Completed : status =TaskStatuses.New
    dispatch(updateTaskTC(props.task.id, {status}, props.todolistId))
  }, [])

  return (
    <div key={props.task.id} className={props.task.status === TaskStatuses.Completed ? 'is-done' : ''}>
      <Checkbox checked={props.task.status === TaskStatuses.Completed} color="primary" onChange={changeStatus}/>
      <EditableSpan value={props.task.title} onChange={changeTaskTitle}/>
      <IconButton onClick={removeTask}>
        <Delete/>
      </IconButton>
    </div>
  )
})
