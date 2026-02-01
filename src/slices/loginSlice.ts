import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { userLogin, refreshPage } from '../api/loginAPI';
import jwt_decode from "jwt-decode";
import User from '../models/User';

export interface loginState {
  active: boolean;
  access: string;
  username: string;
  refresh: string;
}


const initialState: loginState = {
   active: false,
  access:"",
  username:"",
  refresh:"",
};

export const userLoginAsync = createAsyncThunk(
  'login/userLogin',
  async (user:User) => {
    const response = await userLogin(user);
    return response.data;}
);

export const refreshPageAsync = createAsyncThunk(
  'login/refreshPage',
  async (refresh:string) => {
    const response = await refreshPage(refresh);
    return response.data;}
);



export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    logout:(state)=>{
      state.active = false
      state.username = ""
      state.access = ""
      state.refresh = ""
      localStorage.setItem("access","")
      localStorage.setItem("refresh","")
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLoginAsync.fulfilled, (state, action) => {
  state.access = action.payload.access;
  state.refresh = action.payload.refresh;
  state.active = true;
  state.username = jwt_decode<any>(state.access).username;

  localStorage.setItem("access", action.payload.access);
  localStorage.setItem("refresh", action.payload.refresh);
})

.addCase(refreshPageAsync.fulfilled, (state, action) => {
  state.access = action.payload.access;
  state.refresh = action.payload.refresh;
  state.active = true;
})
.addCase(refreshPageAsync.rejected, (state) => {
  state.active = false;
  state.access = "";
  state.refresh = "";
  localStorage.clear();
});

  },
});

export const {logout} = loginSlice.actions;
export const selectActive = (state: RootState) => state.login.active;
export const selectAccess = (state: RootState) => state.login.access;
export const selectUserName = (state: RootState) => state.login.username;
export default loginSlice.reducer;
