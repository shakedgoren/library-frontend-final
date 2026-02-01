// components/Loading.tsx
import React from "react";
import "../LoginPage/css/modern.css";

const Loading = () => {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <div className="book-loader">
          <span />
          <span />
          <span />
        </div>

        <h2 className="loading-title">ספריית החלומות</h2>
        <p className="loading-subtitle">טוען נתונים בזמן אמת…</p>

        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
