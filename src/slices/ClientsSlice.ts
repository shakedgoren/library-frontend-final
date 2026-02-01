import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import Client from '../models/Client';
import { getClients, addClient, deleteClient, updateClient } from '../api/clientsAPI';

export interface ClientsState {
  client:Client[],
  refresh:boolean
}

const initialState: ClientsState = {
  client:[],
  refresh: false
};

export const getClientsAsync = createAsyncThunk(
  'clients/getClients',
  async (access:string) => {
    const response = await getClients(access);
    return response;}
);

export const addClientAsync = createAsyncThunk(
  'clients/addClient',
  async (data:any) => {
    const response = await addClient(data.client,data.access);
    return response;}
);

export const deleteClientAsync = createAsyncThunk(
  'clients/deleteClient',
  async (data:any) => {
    const response = await deleteClient(data.client,data.access);
    return response;}
);

export const updateClientAsync = createAsyncThunk(
  'clients/updateClient',
  async (data:any) => {
    const response = await updateClient(data.client,data.access);
    return response;}
);

export const ClientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClientsAsync.fulfilled, (state,action) => {
        state.client = action.payload.data
      })
      .addCase(addClientAsync.fulfilled, (state) => {
        state.refresh =! state.refresh
      })
      .addCase(deleteClientAsync.fulfilled, (state) => {
        state.refresh =! state.refresh
      })
      .addCase(updateClientAsync.fulfilled, (state) => {
        state.refresh =! state.refresh
      });
  },
});

export const { } = ClientsSlice.actions;
export const selectClient = (state: RootState) => state.clients.client;
export const selectRefresh = (state: RootState) => state.clients.refresh;
export default ClientsSlice.reducer;
