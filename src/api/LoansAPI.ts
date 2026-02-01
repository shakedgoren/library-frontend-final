import axios from 'axios';
import {Loan } from '../models/Loan';
import { MY_SERVER } from './env';

export function getLoans(access:string) {
  return new Promise <{data:any[]}> ((resolve) =>
    axios.get(MY_SERVER+'loans/',{headers:{'Authorization':`Bearer ${access}`}})
    .then(res=>resolve({data:res.data})));
}

export function addLoan(loan:Loan,access:string) {
  return new Promise<{data:Loan}>((resolve) => 
  axios.post(MY_SERVER+"loans/",loan,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}

export function deleteLoan(loan: Loan, access: string) {
  return axios.delete(MY_SERVER + "loans/" + loan.id , {
    headers: { Authorization: `Bearer ${access}` },
  });
}

export function updateLoan(loan:Loan,access:string) {
  return new Promise<{data:Loan}>((resolve) => 
  axios.put(MY_SERVER+"loans/"+loan.id ,loan,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}
