import React, {ChangeEvent, useCallback} from 'react'
import {Checkbox, IconButton} from '@mui/material'
import {Delete} from '@mui/icons-material'
import {tasksThunks} from "features/todolistList/tasks-reducer"
import {useAppDispatch} from "common/hooks/useAppDispatch"
import {EditableSpan} from "common/components";
import {TaskStatuses} from "common/enums/common.enums";
import {TaskType} from "features/todolistList/todolists.api";


type TaskPropsType = {
  task: TaskType
  todolistId: string
}

export const Task = React.memo((props: TaskPropsType) => {

  const dispatch = useAppDispatch()

  const delTask = useCallback(() => {
    dispatch(tasksThunks.removeTask({taskId: props.task.id, todolistId: props.todolistId}))
  }, [])

  const changeTaskTitle = useCallback((title: string) => {
    dispatch(tasksThunks.updateTask({taskId: props.task.id, domainModel: {title}, todolistId: props.todolistId}))
  }, [])

  const changeStatus = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    let status: TaskStatuses
    e.currentTarget.checked ? status = TaskStatuses.Completed : status = TaskStatuses.New
    dispatch(tasksThunks.updateTask({taskId: props.task.id, domainModel: {status}, todolistId: props.todolistId}))
  }, [])

  return (
    <div key={props.task.id} className={props.task.status === TaskStatuses.Completed ? 'is-done' : ''}>
      <Checkbox checked={props.task.status === TaskStatuses.Completed} color="primary" onChange={changeStatus}/>
      <EditableSpan value={props.task.title} onChange={changeTaskTitle}/>
      <IconButton onClick={delTask}>
        <Delete/>
      </IconButton>
    </div>
  )
})
