import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import {Loan} from '../models/Loan';
import { getLoans, addLoan, deleteLoan, updateLoan } from '../api/LoansAPI';


export interface LoansState {
  loan:Loan[],
  refresh:boolean,
  error: string | null;
}

const initialState: LoansState = {
  loan:[],
  refresh: false,
  error: null,
};

// ✅ helper קטן להודעות שגיאה
function formatThunkError(err: any) {
  const status = err?.response?.status;
  if (status === 401) return "Unauthorized (401) – missing/invalid token";
  if (status === 403) return "Forbidden (403)";
  if (status === 404) return "Not found (404)";
  return err?.response?.data?.message || err?.message || "Request failed";
}

export const getLoansAsync = createAsyncThunk<
  any, // response
  string, // access
  { rejectValue: string }
>("loans/getLoans", async (access, { rejectWithValue }) => {
  try {
    const response = await getLoans(access);
    return response;
  } catch (err: any) {
    return rejectWithValue(formatThunkError(err));
  }
});

export const addLoanAsync = createAsyncThunk<
  any,
  { loan: any; access: string },
  { rejectValue: string }
>("loans/addLoan", async ({ loan, access }, { rejectWithValue }) => {
  try {
    const response = await addLoan(loan, access);
    return response;
  } catch (err: any) {
    return rejectWithValue(formatThunkError(err));
  }
});

export const deleteLoanAsync = createAsyncThunk<
  any,
  { loan: any; access: string },
  { rejectValue: string }
>("loans/deleteLoan", async ({ loan, access }, { rejectWithValue }) => {
  try {
    const response = await deleteLoan(loan, access);
    return response;
  } catch (err: any) {
    return rejectWithValue(formatThunkError(err));
  }
});

export const updateLoanAsync = createAsyncThunk<
  any,
  { loan: any; access: string },
  { rejectValue: string }
>("loans/updateLoan", async ({ loan, access }, { rejectWithValue }) => {
  try {
    const response = await updateLoan(loan, access);
    return response;
  } catch (err: any) {
    return rejectWithValue(formatThunkError(err));
  }
});

export const LoansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder

      // GET
      .addCase(getLoansAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(getLoansAsync.fulfilled, (state, action) => {
        state.loan = action.payload?.data ?? [];
        state.error = null;
      })
      .addCase(getLoansAsync.rejected, (state, action) => {
        state.error = action.payload || "Failed to load loans";
      })

       // ADD
      .addCase(addLoanAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addLoanAsync.fulfilled, (state) => {
        state.refresh = !state.refresh;
        state.error = null;
      })
      .addCase(addLoanAsync.rejected, (state, action) => {
        state.error = action.payload || "Failed to add loan";
      })

      // DELETE
      .addCase(deleteLoanAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteLoanAsync.fulfilled, (state) => {
        state.refresh = !state.refresh;
        state.error = null;
      })
      .addCase(deleteLoanAsync.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete loan";
      })

      // UPDATE
      .addCase(updateLoanAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateLoanAsync.fulfilled, (state) => {
        state.refresh = !state.refresh;
        state.error = null;
      })
      .addCase(updateLoanAsync.rejected, (state, action) => {
        state.error = action.payload || "Failed to update loan";
      });
  },
});

export const selectLoan = (state: RootState) => state.loans.loan;
export const selectRefresh = (state: RootState) => state.loans.refresh;
export const selectLoansError = (state: RootState) => state.loans.error;

export default LoansSlice.reducer;
