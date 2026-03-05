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

// calculates overdue days. For open loans: compareDate = today. For closed loans: compareDate = returnDate (actual return date)
function daysLate(endDateIso?: string, compareDateIso?: string | null) {
  if (!endDateIso) return 0;
  const due = new Date(endDateIso);
  const compareDate = compareDateIso ? new Date(compareDateIso) : new Date();
  due.setHours(0, 0, 0, 0);
  compareDate.setHours(0, 0, 0, 0);
  const diff = compareDate.getTime() - due.getTime();
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

  // sorting
  type SortKey = "book" | "client" | "date" | "status" | null;
  type SortDir = "asc" | "desc";
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: Exclude<SortKey, null>) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    if (!access) return;
    dispatch(getLoansAsync(access));
    dispatch(getBooksAsync(access));
    dispatch(getClientsAsync(access));
  }, [dispatch, access, refresh]);

  const filteredAndSortedLoans = useMemo(() => {
    // 1. Filter by condition (Open/Closed/All)
    let result = condition === "all"
      ? loans
      : loans.filter((l) => l.loanStatus === condition);

    // 2. Filter by Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((l) =>
        String(l?.clientID?.name ?? l?.clientID?.clientName ?? "").toLowerCase().includes(q)
      );
    }

    // 3. Sort
    if (!sortKey) return result;

    // Helper: status priority - Overdue (0) > Active (1) > Closed (2)
    const getStatusPriority = (loan: any) => {
      if (loan.loanStatus === true) return 2; // closed/returned
      const late = daysLate(loan.endDate); // open loan, compare to today
      return late > 0 ? 0 : 1; // 0=overdue, 1=active
    };

    const dir = sortDir === "asc" ? 1 : -1;
    return result.slice().sort((a, b) => {
      if (sortKey === "book") {
        const nameA = (a?.bookID?.name ?? a?.bookID?.bookName ?? "").toLowerCase();
        const nameB = (b?.bookID?.name ?? b?.bookID?.bookName ?? "").toLowerCase();
        return nameA.localeCompare(nameB, "he") * dir;
      }
      if (sortKey === "client") {
        const nameA = (a?.clientID?.name ?? a?.clientID?.clientName ?? "").toLowerCase();
        const nameB = (b?.clientID?.name ?? b?.clientID?.clientName ?? "").toLowerCase();
        return nameA.localeCompare(nameB, "he") * dir;
      }
      if (sortKey === "date") {
        return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * dir;
      }
      if (sortKey === "status") {
        return (getStatusPriority(a) - getStatusPriority(b)) * dir;
      }
      return 0;
    });
  }, [loans, condition, search, sortKey, sortDir]);

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
          loanStatus: false,
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

    const closing = !loan.loanStatus; // true = we are now closing the loan
    const todayISO = toISODate(new Date());

    dispatch(
      updateLoanAsync({
        loan: {
          id: loan.id,
          bookID: loan?.bookID?.id,
          clientID: loan?.clientID?.id,
          startDate: loan.startDate,
          endDate: loan.endDate,
          loanStatus: !loan.loanStatus,
          // שמור תאריך החזרה בפועל כדי לחשב עיכוב
          returnDate: closing ? todayISO : null,
        },
        access,
      })
    );

    toast(loan.loanStatus ? "השאלה נפתחה מחדש" : "הספר הוחזר בהצלחה", {
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
        <h2 className="card-title">השאלות ({filteredAndSortedLoans.length})</h2>

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
              <th onClick={() => toggleSort("book")} className="sortable-th">
                <span className="th-content">
                  ספר
                  <span className={`sort-icon ${sortKey === "book" ? "active" : ""}`}>
                    {sortKey === "book" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </span>
              </th>
              <th onClick={() => toggleSort("client")} className="sortable-th">
                <span className="th-content">
                  לקוח
                  <span className={`sort-icon ${sortKey === "client" ? "active" : ""}`}>
                    {sortKey === "client" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </span>
              </th>
              <th onClick={() => toggleSort("date")} className="sortable-th">
                <span className="th-content">
                  תאריך השאלה
                  <span className={`sort-icon ${sortKey === "date" ? "active" : ""}`}>
                    {sortKey === "date" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </span>
              </th>
              <th>תאריך החזרה</th>
              <th onClick={() => toggleSort("status")} className="sortable-th">
                <span className="th-content">
                  סטטוס
                  <span className={`sort-icon ${sortKey === "status" ? "active" : ""}`}>
                    {sortKey === "status" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
                  </span>
                </span>
              </th>
              <th>ימי עיכוב</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {filteredAndSortedLoans.map((loan: any) => {
              const isClosed = loan.loanStatus === true;
              // For open loans: delay from endDate to today. For closed loans: delay from endDate to returnDate
              const overdueDays = isClosed
                ? daysLate(loan.endDate, loan.returnDate)
                : daysLate(loan.endDate);
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
                        // "החזר" = שינוי סטטוס למוחזר
                        toggleLoanStatus(loan);
                      }}
                      type="button"
                      style={{ opacity: loan.loanStatus ? 0.5 : 1 }}
                      title={loan.loanStatus ? "השאלה סגורה" : "החזר ספר"}
                    >
                      {loan.loanStatus ? "🔄 פתח" : "✅ החזר"}
                    </button>

                    <button className="btn-small edit" onClick={() => openEditForm(loan)} type="button">
                      ✏️ ערוך
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty */}
      {filteredAndSortedLoans.length === 0 && (
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
