import axios from 'axios';
import Book from '../models/Book';
import { MY_SERVER } from './env';

export function getBooks(access:string) {
  return new Promise <{data:Book[]}> ((resolve) =>
    axios.get(MY_SERVER+'books/',{headers: {'Authorization': `Bearer ${access}`}})
    .then(res=>resolve({data:res.data})));
}

export function addBook(book:Book,access:string) {
  return new Promise<{data:Book}>((resolve) => 
  axios.post(MY_SERVER+"books/",book,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}

export function deleteBook(book:Book,access:string,) {
  return new Promise<{data:Book}>((resolve) => 
  axios.put(MY_SERVER+"books/"+book.id,book,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}

export function updateBook(book:Book,access:string) {
  return new Promise<{data:Book}>((resolve) => 
  axios.put(MY_SERVER+"books/"+book.id,book,{headers:{'Authorization':`Bearer ${access}`}})
  .then(res=>resolve({data:res.data})));
}
