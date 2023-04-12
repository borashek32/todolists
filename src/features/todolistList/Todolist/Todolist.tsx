import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from 'api/todolists-api'
import {changeTodolistTitleTC, FilterValuesType, removeTodolistTC, todolistActions, TodolistDomainType} from '../todolists-reducer'
import {addTaskTC, fetchTasks} from '../tasks-reducer'
import {useAppDispatch} from 'hooks/useAppDispatch'
import {Button, IconButton} from '@mui/material'
import {Delete} from '@mui/icons-material'


type PropsType = {
  todolist: TodolistDomainType
  tasks: Array<TaskType>
  demo?: boolean
}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo) return
    dispatch(fetchTasks(props.todolist.id))
  }, [])

  const addTask = useCallback((title: string) => dispatch(addTaskTC(title, props.todolist.id)), [dispatch, props.todolist.id])
  const removeTodolist = useCallback(() => dispatch(removeTodolistTC(props.todolist.id)), [dispatch, props.todolist.id])
  const changeTodolistTitle = useCallback((title: string) => dispatch(changeTodolistTitleTC(props.todolist.id, title)), [dispatch, props.todolist.id])

  const changeFilter = useCallback((value: FilterValuesType) => {
    dispatch(todolistActions.changeTodolistFilter({id: props.todolist.id, filter: value}))
  }, [dispatch, props.todolist.id])

  let tasksForTodolist = props.tasks
  if (props.todolist.filter === 'active') tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
  if (props.todolist.filter === 'completed') tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)

  return (
    <div>
      <h3>
        <EditableSpan value={props.todolist.title} onChange={changeTodolistTitle}/>
        <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === 'loading'}>
          <Delete/>
        </IconButton>
      </h3>
      <AddItemForm addItem={addTask} disabled={props.todolist.entityStatus === 'loading'}/>
      <div>
        {tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todolist.id}/>)}
      </div>
      <div style={{paddingTop: '10px'}}>
        <Button variant={props.todolist.filter === 'all' ? 'outlined' : 'text'} onClick={() => changeFilter('all')} color={'inherit'}>
          All
        </Button>
        <Button variant={props.todolist.filter === 'active' ? 'outlined' : 'text'} onClick={() => changeFilter('active')} color={'primary'}>
          Active
        </Button>
        <Button variant={props.todolist.filter === 'completed' ? 'outlined' : 'text'} onClick={() => changeFilter('completed')} color={'secondary'}>
          Completed
        </Button>
      </div>
    </div>
  )
})


