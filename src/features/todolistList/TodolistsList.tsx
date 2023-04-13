import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {Grid, Paper} from '@mui/material'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch'
import {selectTasks, selectTodolists} from "features/todolistList/todolistsList.selector"
import {selectIsLoggedIn} from "features/auth/auth.selector"
import {todolistsThunks} from "features/todolistList/todolists-reducer";
import {AddItemForm} from "common/components";


type PropsType = {
  demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
  const todolists = useSelector(selectTodolists)
  const tasks = useSelector(selectTasks)
  const isLoggedIn = useSelector(selectIsLoggedIn)

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (demo || !isLoggedIn) return
    dispatch(todolistsThunks.fetchTodolists())
  }, [dispatch])

  const addTodolist = useCallback((title: string) => {
    dispatch(todolistsThunks.addTodolist({title}))
  }, [dispatch])

  if (!isLoggedIn) return <Navigate to={"/login"}/>

  return <>
    <Grid container style={{padding: '20px'}}>
      <AddItemForm addItem={addTodolist}/>
    </Grid>
    <Grid container spacing={3}>
      {
        todolists.map(tl => {
          let allTodolistTasks = tasks[tl.id]

          return <Grid item key={tl.id}>
            <Paper style={{padding: '10px'}}>
              <Todolist todolist={tl} tasks={allTodolistTasks} demo={demo}/>
            </Paper>
          </Grid>
        })
      }
    </Grid>
  </>
}
