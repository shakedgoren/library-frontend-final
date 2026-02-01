import React, { useEffect, useMemo, useState } from "react";
import "../LoginPage/css/modern.css";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectAccess } from "../slices/loginSlice";
import {
  getBooksAsync,
  addBookAsync,
  deleteBookAsync,
  updateBookAsync,
  selectBook,
  selectRefresh,
} from "../slices/BooksSlice";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Condition = "all" | boolean;

const BOOK_TYPE_LABEL: Record<number, string> = {
  1: "Teenages Book",
  2: "Adults Book",
  3: "Comics",
};

const Books = () => {
  const dispatch = useAppDispatch();
  const books = useAppSelector(selectBook) as any[]; // לפי הסלייס שלך
  const refresh = useAppSelector(selectRefresh);
  const access = useAppSelector(selectAccess);

  // UI state
  const [condition, setCondition] = useState<Condition>("all");
  const [search, setSearch] = useState("");

  // Form state (משמש גם להוספה וגם לעריכה)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedYear, setPublishedYear] = useState("");
  const [bookType, setBookType] = useState<number>(0);

  // fetch books
  useEffect(() => {
    if (!access) return;
    dispatch(getBooksAsync(access));
  }, [dispatch, access, refresh]);

  const filteredBooks = useMemo(() => {
    const byCondition =
      condition === "all"
        ? books
        : books.filter((b) => b.bookStatus === condition);

    const q = search.trim().toLowerCase();
    if (!q) return byCondition;

    return byCondition.filter((b) =>
      String(b.bookName ?? "").toLowerCase().includes(q)
    );
  }, [books, condition, search]);

  function resetForm() {
    setEditingId(null);
    setBookName("");
    setAuthor("");
    setPublishedYear("");
    setBookType(0);
  }

  function openAddForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(book: any) {
    setEditingId(book.id);
    setBookName(book.bookName ?? "");
    setAuthor(book.author ?? "");
    setPublishedYear(book.publishedYear ?? "");
    setBookType(Number(book.bookType ?? 0));
    setIsFormOpen(true);
  }

  function handleSubmit() {
    if (!access) return;

    // הוספה
    if (editingId === null) {
      dispatch(
        addBookAsync({
          book: {
            bookName,
            author,
            publishedYear,
            bookType,
            bookStatus: true,
          },
          access,
        })
      );

      toast("Book was added", {
        position: "top-right",
        autoClose: 4000,
        type: "success",
        theme: "colored",
      });

      resetForm();
      setIsFormOpen(false);
      return;
    }

    // עדכון
    dispatch(
      updateBookAsync({
        book: {
          id: editingId,
          bookName,
          author,
          publishedYear,
          bookType,
          // נשמור את הסטטוס הקיים דרך ה־DB/סלייס; אם חייבים כאן:
          // bookStatus: books.find(b => b.id === editingId)?.bookStatus
        },
        access,
      })
    );

    toast("Book was updated", {
      position: "top-right",
      autoClose: 4000,
      type: "success",
      theme: "colored",
    });

    resetForm();
    setIsFormOpen(false);
  }

  function toggleStock(book: any) {
    if (!access) return;

    dispatch(
      deleteBookAsync({
        book: {
          id: book.id,
          bookName: book.bookName,
          author: book.author,
          publishedYear: book.publishedYear,
          bookType: book.bookType,
          bookStatus: !book.bookStatus,
        },
        access,
      })
    );

    toast(book.bookStatus ? "Marked out of stock" : "Returned to stock", {
      position: "top-right",
      autoClose: 3000,
      type: "info",
      theme: "colored",
    });
  }

  const totalCount = filteredBooks.length;

  return (
    <div className="card" style={{ direction: "rtl" }}>
      <ToastContainer />

      {/* Header */}
      <div className="card-header">
        <h2 className="card-title">כל הספרים ({totalCount})</h2>

        <button className="btn-primary" onClick={() => (isFormOpen ? setIsFormOpen(false) : openAddForm())}>
          {isFormOpen ? "✖️ סגור" : "➕ הוסף ספר חדש"}
        </button>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <button
          className={`btn-small secondary ${condition === "all" ? "success" : ""}`}
          onClick={() => setCondition("all")}
          type="button"
        >
          כל הספרים
        </button>

        <button
          className={`btn-small secondary ${condition === true ? "success" : ""}`}
          onClick={() => setCondition(true)}
          type="button"
        >
          במלאי
        </button>

        <button
          className={`btn-small secondary ${condition === false ? "warning" : ""}`}
          onClick={() => setCondition(false)}
          type="button"
        >
          מחוץ למלאי
        </button>

        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            className="form-input"
            placeholder="חיפוש לפי שם ספר..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Form (Add/Edit) */}
      {isFormOpen && (
        <div className="login-form" style={{ maxWidth: 999, marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">שם הספר</label>
            <input
              className="form-input"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              placeholder="הקלד שם ספר"
            />
          </div>

          <div className="form-group">
            <label className="form-label">מחבר</label>
            <input
              className="form-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="הקלד מחבר"
            />
          </div>

          <div className="form-group">
            <label className="form-label">שנת הוצאה</label>
            <input
              className="form-input"
              value={publishedYear}
              onChange={(e) => setPublishedYear(e.target.value)}
              placeholder="לדוגמה: 2024"
            />
          </div>

          <div className="form-group">
            <label className="form-label">סוג ספר</label>
            <select
              className="form-input"
              value={bookType}
              onChange={(e) => setBookType(Number(e.target.value))}
            >
              <option value={0}>בחר סוג...</option>
              <option value={1}>Teenages Book</option>
              <option value={2}>Adults Book</option>
              <option value={3}>Comics</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-start", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={handleSubmit} type="button">
              {editingId === null ? "➕ הוסף" : "💾 שמור שינויים"}
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
              <th>שם הספר</th>
              <th>מחבר</th>
              <th>קטגוריה</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>

          <tbody>
            {filteredBooks.map((book: any) => {
              const categoryLabel = BOOK_TYPE_LABEL[Number(book.bookType)] ?? "—";

              const statusLabel = book.bookStatus ? "זמין" : "לא זמין";
              const statusClass = book.bookStatus ? "available" : "inactive"; // לשמור על העיצוב הקיים

              // class לקטגוריה: אם בעברית זה יושב אצלך כבר ב-CSS, אפשר לשנות פה.
              // כרגע משתמשים באנגלית כדי לא לשבור את ה-CSS שלך:
              const categoryClass =
                categoryLabel.toLowerCase().replace(/\s+/g, "-") || "unknown";

              return (
                <tr key={book.id}>

                  <td>{book.bookName}</td>

                  <td>{book.author}</td>

                  <td>
                    <span className={`category-badge ${categoryClass}`}>
                      {categoryLabel}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn-small edit"
                      onClick={() => openEditForm(book)}
                      type="button"
                    >
                      ✏️ ערוך
                    </button>

                    <button
                      className={`btn-small ${book.bookStatus ? "warning" : "success"}`}
                      onClick={() => toggleStock(book)}
                      type="button"
                      title={book.bookStatus ? "הוצא מהמלאי" : "החזר למלאי"}
                    >
                      {book.bookStatus ? "📤 הוצא" : "📥 החזר"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>אין ספרים להצגה</h3>
          <p>נסי לשנות חיפוש/סינון או להוסיף ספר חדש</p>
          <button className="btn-primary" onClick={openAddForm} type="button">
            הוסף ספר ראשון
          </button>
        </div>
      )}
    </div>
  );
};

export default Books;

