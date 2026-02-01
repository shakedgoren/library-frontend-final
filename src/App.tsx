import React, { useEffect, useState } from "react";
import { NextUIProvider, Button } from "@nextui-org/react";
import { useAppDispatch } from "./app/hooks";
import { refreshPageAsync } from "./slices/loginSlice";
import Main from "./components/Main";

type ThemeMode = "light" | "dark";

function App() {
  const dispatch = useAppDispatch();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  // רענון טוקן/סשן שלך
  useEffect(() => {
    dispatch(refreshPageAsync(localStorage.getItem("refresh") || ""));
  }, [dispatch]);

  // מחיל class על BODY כדי שה-CSS שלך ידע לעבור לדארק
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <NextUIProvider>
      {/* כפתור קבוע בפינה */}
      <div style={{ position: "fixed", top: 12, left: 12, zIndex: 99999 }}>
        <div className="theme-toggle" onClick={toggleTheme} role="button" aria-label="Toggle theme" tabIndex={0}>
  <div className={`theme-toggle-track ${theme === "dark" ? "is-dark" : ""}`}>
    <div className="theme-toggle-thumb">
      <span className="theme-toggle-icon">{theme === "dark" ? "🌙" : "☀️"}</span>
    </div>
  </div>
</div>

      </div>

      <Main />
    </NextUIProvider>
  );
}

export default App;
