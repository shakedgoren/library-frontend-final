import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import BooksSlice from '../slices/BooksSlice';
import ClientsSlice from '../slices/ClientsSlice';
import LoansSlice from '../slices/LoansSlice';
import loginSlice from '../slices/loginSlice';

export const store = configureStore({
  reducer: {
    login:loginSlice,
    books:BooksSlice,
    loans:LoansSlice,
    clients:ClientsSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
