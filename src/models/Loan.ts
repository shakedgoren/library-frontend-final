export class Loan{
    id?:number
    bookID:{"name":string,"id":number,"type":number}={"name":"","id":0,"type":0}
    clientID:{"name":string,"id":number}={"name":"","id":0}
    startDate:string=""
    endDate?:string=""
    loanStatus:Boolean=false
}
