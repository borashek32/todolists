import {Dispatch} from "redux"
import { ResponseType } from 'common/types/common.types'
import {appActions, SetAppErrorActionType, SetAppStatusActionType} from "app/app-reducer"

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>) => {
  if (data.messages.length) {
    dispatch(appActions.setAppError({error: data.messages[0]}))
  } else {
    dispatch(appActions.setAppError({error: 'Some error occurred'}))
  }
  dispatch(appActions.setAppStatus({status: 'failed'}))
}