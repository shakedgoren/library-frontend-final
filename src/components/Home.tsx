import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  userLoginAsync,
  selectActive,
  selectUserName,
} from "../slices/loginSlice";
import "react-toastify/dist/ReactToastify.css";
import { Checkbox } from "@nextui-org/react";

import myFavIcon from "../LoginPage/images/favicon.jpeg";
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

const Home = () => {
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectActive);
  const user = useAppSelector(selectUserName);

  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [rememberme, setrememberme] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const myBooks: any[] = [
    { id: 1, src: book1 },
    { id: 2, src: book2 },
    { id: 3, src: book3 },
    { id: 4, src: book4 },
    { id: 5, src: book5 },
    { id: 6, src: book6 },
    { id: 7, src: book7 },
    { id: 8, src: book8 },
    { id: 9, src: book9 },
    { id: 10, src: book10 },
    { id: 11, src: book11 },
    { id: 12, src: book12 },
  ];

  useEffect(() => {
    localStorage.setItem("remember", JSON.stringify(rememberme));
  }, [rememberme]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("אנא הזן שם משתמש וסיסמה");
      return;
    }

    setLoading(true);
    try {
      await dispatch(userLoginAsync({ username, password }) as any);
    } catch (err) {
      setError("התחברות נכשלה. בדוק את הנתונים שלך.");
    } finally {
      setLoading(false);
    }
  };

  // רק דף כניסה - בלי Layout כשלא מחובר
  return (
    <div className="modern-login-page">
      <div className="login-form-wrapper">
        <div className="login-header">
          <img src={myFavIcon} alt="Logo" className="logo-icon" />
          <h1 className="app-title">מערכת הספרייה</h1>
          <p className="app-subtitle">ניהול חכם של הספרים שלך</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              שם משתמש
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="הזן שם משתמש"
              value={username}
              onChange={(e) => setusername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="הזן סיסמה"
              value={password}
              onChange={(e) => setpassword(e.target.value)}
              disabled={loading}
            />
            
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-remember">
  <Checkbox 
    isSelected={rememberme}
    onValueChange={setrememberme}
    className="remember-checkbox-card"
  >
    זכור אותי
  </Checkbox>
</div>

          <button
            type="submit"
            className={`login-button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>

        </form>

        <div className="login-footer">
          <p className="footer-text">
            © 2026 מערכת הספרייה. כל הזכויות שמורות.
          </p>
        </div>
      </div>

      <div className="books-section">
        <div className="carousel-header">
          <h2>הספרים הפופולריים שלנו</h2>
        </div>
        <div className="carousel-container">
          <div className="books-grid">
            {myBooks.map((book) => (
              <div key={book.id} className="book-card">
                <img
                  src={book.src}
                  alt={`Book ${book.id}`}
                  className="book-image"
                />
                <div className="book-overlay">
                  <span className="book-number">#{book.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="carousel-footer">
          <p className="carousel-text">
            גלה את אוסף הספרים הענק שלנו וניהל אותם בקלות.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;