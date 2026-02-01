import React, { useEffect, useMemo, useState } from "react";
import "../LoginPage/css/modern.css";

import { useAppSelector, useAppDispatch } from "../app/hooks";
import { selectAccess } from "../slices/loginSlice";
import {
  getLoansAsync,
  addLoanAsync,
  deleteLoanAsync,
  updateLoanAsync,
  selectLoan,
  selectRefresh,
} from "../slices/LoansSlice";

import { selectBook, getBooksAsync } from "../slices/BooksSlice";
import { selectClient, getClientsAsync } from "../slices/ClientsSlice";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Condition = "all" | boolean;

function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// התאריך שמוצג בטבלה (dd/mm/yyyy) כמו בדוגמה שלך
function isoToDisplay(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function daysLate(endDateIso?: string) {
  if (!endDateIso) return 0;
  const due = new Date(endDateIso);
  const now = new Date();
  // נטרול שעות כדי לקבל ימים נקיים
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - due.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

const Loans = () => {
  const dispatch = useAppDispatch();
  const loans = useAppSelector(selectLoan) as any[]; // לפי הסלייס שלך
  const books = useAppSelector(selectBook) as any[];
  const clients = useAppSelector(selectClient) as any[];
  const refresh = useAppSelector(selectRefresh);
  const access = useAppSelector(selectAccess);

  // add/edit form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [clientID, setClientID] = useState<number>(0);
  const [bookID, setBookID] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd
  const [bookType, setBookType] = useState<number>(0); // לשם חישוב due date

  // filters
  const [condition, setCondition] = useState<Condition>("all");
  const [search, setSearch] = useState("");

  // due date calc (כמו בקוד 1 אבל מתוקן עם padding)
  const dateLoans = (book_type: number, mydate: string) => {
    const date = new Date(String(mydate));
    if (book_type === 1) date.setDate(date.getDate() + 10);
    if (book_type === 2) date.setDate(date.getDate() + 5);
    if (book_type === 3) date.setDate(date.getDate() + 3);
    return toISODate(date);
  };

  useEffect(() => {
    if (!access) return;
    dispatch(getLoansAsync(access));
    dispatch(getBooksAsync(access));
    dispatch(getClientsAsync(access));
  }, [dispatch, access, refresh]);

  const filteredLoans = useMemo(() => {
    const byCondition =
      condition === "all"
        ? loans
        : loans.filter((l) => l.loanStatus === condition);

    const q = search.trim().toLowerCase();
    if (!q) return byCondition;

    // בקוד 1 היה loan.clientID.name (אובייקט). נשמור תאימות:
    return byCondition.filter((l) =>
      String(l?.clientID?.name ?? "").toLowerCase().includes(q)
    );
  }, [loans, condition, search]);

  function resetForm() {
    setEditingId(null);
    setClientID(0);
    setBookID(0);
    setStartDate("");
    setBookType(0);
  }

  function openAddForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(loan: any) {
    setEditingId(loan.id);

    // בקוד 1: bookID ו-clientID בטבלה הם אובייקטים (loan.bookID.id)
    setClientID(Number(loan?.clientID?.id ?? 0));
    setBookID(Number(loan?.bookID?.id ?? 0));

    setStartDate(String(loan.startDate ?? ""));
    setBookType(Number(loan?.bookID?.type ?? loan?.bookID?.bookType ?? 0));

    setIsFormOpen(true);
  }

  function addLoan() {
    if (!access) return;
    if (!clientID || !bookID || !startDate) {
      toast("חובה לבחור לקוח, ספר ותאריך השאלה", {
        position: "top-right",
        autoClose: 3500,
        type: "error",
        theme: "colored",
      });
      return;
    }

    dispatch(
      addLoanAsync({
        loan: {
          clientID,
          bookID,
          startDate,
          endDate: dateLoans(bookType, startDate),
          bookStatus: false, // כמו בקוד 1
        },
        access,
      })
    );

    toast("Loan was added", {
      position: "top-right",
      autoClose: 4000,
      type: "success",
      theme: "colored",
    });

    resetForm();
    setIsFormOpen(false);
  }

  function updateLoan(loan: any) {
    if (!access) return;

    const finalClientId = clientID || loan?.clientID?.id;
    const finalBookId = bookID || loan?.bookID?.id;

    const finalStart = startDate || loan.startDate;
    const finalType =
      (bookType !== 0 ? bookType : loan?.bookID?.type ?? loan?.bookID?.bookType) || 0;

    dispatch(
      updateLoanAsync({
        loan: {
          id: loan.id,
          bookID: finalBookId,
          clientID: finalClientId,
          startDate: finalStart,
          endDate: dateLoans(finalType, finalStart),
          loanStatus: loan.loanStatus,
        },
        access,
      })
    );

    toast("Loan was updated", {
      position: "top-right",
      autoClose: 3500,
      type: "success",
      theme: "colored",
    });

    resetForm();
    setIsFormOpen(false);
  }

  function toggleLoanStatus(loan: any) {
    if (!access) return;

    dispatch(
      deleteLoanAsync({
        loan: {
          id: loan.id,
          bookID: loan?.bookID?.id,
          clientID: loan?.clientID?.id,
          startDate: loan.startDate,
          endDate: loan.endDate,
          loanStatus: !loan.loanStatus,
        },
        access,
      })
    );

    toast(loan.loanStatus ? "Loan opened" : "Loan closed (returned)", {
      position: "top-right",
      autoClose: 3000,
      type: "info",
      theme: "colored",
    });
  }

  // רשימות לבחירה (כמו בקוד 1: רק לקוחות זמינים + ספרים במלאי)
  const availableClients = useMemo(
    () => clients.filter((c) => c.clientStatus === true),
    [clients]
  );

  const availableBooks = useMemo(
    () => books.filter((b) => b.bookStatus === true),
    [books]
  );

  return (
    <div className="card" style={{ direction: "rtl" }}>
      <ToastContainer />

      {/* Header */}
      <div className="card-header">
        <h2 className="card-title">השאלות ({filteredLoans.length})</h2>

        <button
          className="btn-primary"
          onClick={() => (isFormOpen ? setIsFormOpen(false) : openAddForm())}
          type="button"
        >
          {isFormOpen ? "✖️ סגור" : "➕ השאלה חדשה"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <button
          className={`btn-small secondary ${condition === "all" ? "success" : ""}`}
          onClick={() => setCondition("all")}
          type="button"
        >
          כל ההשאלות
        </button>

        <button
          className={`btn-small secondary ${condition === false ? "success" : ""}`}
          onClick={() => setCondition(false)}
          type="button"
        >
          פתוחות
        </button>

        <button
          className={`btn-small secondary ${condition === true ? "warning" : ""}`}
          onClick={() => setCondition(true)}
          type="button"
        >
          סגורות
        </button>

        <div style={{ flex: 1, minWidth: 260 }}>
          <input
            className="form-input"
            placeholder="חיפוש לפי שם לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="login-form" style={{ maxWidth: 999, marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">לקוח</label>
            <select
              className="form-input"
              value={clientID}
              onChange={(e) => setClientID(Number(e.target.value))}
            >
              <option value={0}>בחר לקוח...</option>
              {availableClients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.clientName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ספר</label>
            <select
              className="form-input"
              value={bookID}
              onChange={(e) => {
                const id = Number(e.target.value);
                setBookID(id);
                const book = availableBooks.find((b: any) => b.id === id);
                setBookType(Number(book?.bookType ?? book?.type ?? 0));
              }}
            >
              <option value={0}>בחר ספר...</option>
              {availableBooks.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.bookName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">תאריך השאלה</label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-start", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() => {
                if (editingId === null) addLoan();
                else {
                  const loan = loans.find((l) => l.id === editingId);
                  if (loan) updateLoan(loan);
                }
              }}
              type="button"
            >
              {editingId === null ? "➕ צור השאלה" : "💾 שמור שינויים"}
            </button>

            <button
              className="btn-small secondary"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
              type="button"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ספר</th>
              <th>לקוח</th>
              <th>תאריך השאלה</th>
              <th>תאריך החזרה</th>
              <th>סטטוס</th>
              <th>ימי עיכוב</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {filteredLoans.map((loan: any) => {
              const isClosed = loan.loanStatus === true; // בקוד 1: true = returned/closed
              const overdueDays = !isClosed ? daysLate(loan.endDate) : 0;
              const statusText = isClosed ? "הוחזר" : overdueDays > 0 ? "מאוחר" : "פעיל";

              const rowClass = overdueDays > 0 && !isClosed ? "overdue-row" : "";
              const statusClass = isClosed ? "inactive" : overdueDays > 0 ? "warning" : "success";

              return (
                <tr key={loan.id} className={`loan-row ${rowClass}`}>

                  <td>{loan?.bookID?.name ?? loan?.bookID?.bookName ?? ""}</td>

                  <td>{loan?.clientID?.name ?? loan?.clientID?.clientName ?? ""}</td>

                  <td>{isoToDisplay(loan.startDate)}</td>

                  <td>{isoToDisplay(loan.endDate)}</td>

                  <td>
                    <span className={`status-badge ${statusClass}`}>{statusText}</span>
                  </td>

                  <td>
                    <span className={`days-badge ${overdueDays > 0 ? "warning" : "success"}`}>
                      {overdueDays > 0 ? `+${overdueDays}` : "בזמן"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-small success"
                      onClick={() => {
                        // "החזר" = לסגור השאלה (loanStatus=true)
                        if (!loan.loanStatus) toggleLoanStatus(loan);
                      }}
                      type="button"
                      style={{ opacity: loan.loanStatus ? 0.5 : 1 }}
                      title={loan.loanStatus ? "כבר הוחזר" : "החזר ספר"}
                    >
                      ✅ החזר
                    </button>

                    <button className="btn-small edit" onClick={() => openEditForm(loan)} type="button">
                      ✏️ ערוך
                    </button>

                    {overdueDays > 0 && !isClosed && (
                      <button className="btn-small warning" type="button">
                        ⏰ התראה
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty */}
      {filteredLoans.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>אין השאלות להצגה</h3>
          <p>נסי לשנות חיפוש/סינון או ליצור השאלה חדשה</p>
          <button className="btn-primary" onClick={openAddForm} type="button">
            השאלה ראשונה
          </button>
        </div>
      )}
    </div>
  );
};

export default Loans;
