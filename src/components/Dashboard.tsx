import React, { useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";

import { selectUserName, selectAccess } from "../slices/loginSlice";
import { getBooksAsync, selectBook } from "../slices/BooksSlice";
import { getClientsAsync, selectClient } from "../slices/ClientsSlice";
import { getLoansAsync, selectLoan } from "../slices/LoansSlice";

import "../LoginPage/css/modern.css";

import book1 from "../LoginPage/images/book1.jpeg";
import book2 from "../LoginPage/images/book2.jpeg";
import book3 from "../LoginPage/images/book3.jpeg";
import book4 from "../LoginPage/images/book4.jpeg";
import book5 from "../LoginPage/images/book5.jpeg";
import book6 from "../LoginPage/images/book6.jpg";
import book7 from "../LoginPage/images/book7.jpeg";
import book8 from "../LoginPage/images/book8.jpeg";
import book9 from "../LoginPage/images/book9.jpeg";
import book10 from "../LoginPage/images/book10.jpeg";
import book11 from "../LoginPage/images/book11.jpeg";
import book12 from "../LoginPage/images/book12.jpeg";
import { Link } from "react-router-dom";

function parseISO(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isOverdue(endDateIso?: string) {
  const due = parseISO(endDateIso);
  if (!due) return false;

  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return due.getTime() < now.getTime();
}

const Dashboard = () => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUserName);
  const access = useAppSelector(selectAccess);

  const books = useAppSelector(selectBook) as any[];
  const clients = useAppSelector(selectClient) as any[];
  const loans = useAppSelector(selectLoan) as any[];

  // תמונות דמו (עד שיהיה תמונות בספרים מה-DB)
  const bookImages = [
    book1, book2, book3, book4, book5, book6,
    book7, book8, book9, book10, book11, book12,
  ];

  // טוען נתונים אמיתיים מהשרת (דרך ה-thunks שלך)
  useEffect(() => {
    if (!access) return;
    dispatch(getBooksAsync(access));
    dispatch(getClientsAsync(access));
    dispatch(getLoansAsync(access));
  }, [dispatch, access]);

  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalClients = clients.length;

    // אצלך: loanStatus=false => פתוח (On loan) | true => סגור (Returned)
    const openLoans = loans.filter((l) => l.loanStatus === false);
    const openLoansCount = openLoans.length;

    const overdueCount = openLoans.filter((l) => isOverdue(l.endDate)).length;

    return [
      { label: "ספרים", value: totalBooks.toLocaleString(), icon: "📚", color: "#0066cc" },
      { label: "לקוחות", value: totalClients.toLocaleString(), icon: "👥", color: "#28a745" },
      { label: "השאלות פעילות", value: openLoansCount.toLocaleString(), icon: "📈", color: "#ffc107" },
      { label: "החזרות מאוחרות", value: overdueCount.toLocaleString(), icon: "⚠️", color: "#dc3545" },
    ];
  }, [books, clients, loans]);

  // רק ספרים זמינים במלאי
  const availableBooks = useMemo(
    () => books.filter((b) => b.bookStatus === true),
    [books]
  );

  // נציג עד 12 כדי להתאים לגריד ולעיצוב שלך
  const booksToShow = useMemo(() => {
    const count = Math.min(12, availableBooks.length);
    return Array.from({ length: count }, (_, i) => ({
      id: availableBooks[i]?.id ?? i + 1,
      src: bookImages[i % bookImages.length],
    }));
  }, [availableBooks, bookImages]);

  return (
    <div className="dashboard">
      {/* סטטיסטיקות - עכשיו אמיתי מה-DB */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ספרים זמינים */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ספרים זמינים בספרייה ({availableBooks.length})</h2>
            <Link to="/books" className="btn-primary">
              למידע נוסף    
            </Link>
        </div>

        <div className="books-grid">
          {booksToShow.map((book) => (
            <div key={book.id} className="book-card">
              <img src={book.src} alt={`ספר ${book.id}`} className="book-image" />
              <div className="book-overlay">
                <span className="book-number">#{String(book.id).padStart(3, "0")}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state קטן אם אין זמינים */}
        {availableBooks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>אין כרגע ספרים זמינים</h3>
            <p>כל הספרים מושאלים או מחוץ למלאי</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
