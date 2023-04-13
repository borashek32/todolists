import { createAsyncThunk } from '@reduxjs/toolkit';
import { AppRootStateType, AppDispatch } from 'app/store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: AppRootStateType,
  dispatch: AppDispatch,
  rejectValue: unknown
}>()