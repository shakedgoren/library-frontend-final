import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState} from '../app/store';
import Book from '../models/Book';
import { getBooks, addBook, deleteBook, updateBook } from '../api/booksAPI';

export interface BooksState {
  book:Book[],
  refresh:boolean
}

const initialState: BooksState = {
  book:[],
  refresh: false
};

export const getBooksAsync = createAsyncThunk(
  'books/getBooks',
  async (access:string) => {
    const response = await getBooks(access);
    return response;}
);

export const addBookAsync = createAsyncThunk(
  'books/addBook',
  async (data:any) => {
    const response = await addBook(data.book,data.access);
    return response;}
);

export const deleteBookAsync = createAsyncThunk(
  'books/deleteBook',
  async (data:any) => {
    const response = await deleteBook(data.book,data.access);
    return response;}
);

export const updateBookAsync = createAsyncThunk(
  'books/updateBook',
  async (data:any) => {
    const response = await updateBook(data.book,data.access);
    return response;}
);

export const BooksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBooksAsync.fulfilled, (state,action) => {
        state.book = action.payload.data
      })
      .addCase(addBookAsync.fulfilled, (state,action) => {
        state.refresh =! state.refresh
      })
      .addCase(deleteBookAsync.fulfilled, (state,action) => {
        state.refresh =! state.refresh
      })
      .addCase(updateBookAsync.fulfilled, (state,action) => {
        state.refresh =! state.refresh
      });
  },
});

export const { } = BooksSlice.actions;
export const selectBook = (state: RootState) => state.books.book;
export const selectRefresh = (state: RootState) => state.books.refresh;
export default BooksSlice.reducer;
