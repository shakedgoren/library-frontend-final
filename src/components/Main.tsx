import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { selectActive } from "../slices/loginSlice";
import Home from "./Home";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Books from "./Books";
import Clients from "./Clients";
import Loans from "./Loans";
import { Spinner } from "@nextui-org/react";
import "../LoginPage/css/modern.css";

const Main = () => {
  const active = useAppSelector(selectActive);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setLoad(true), 1200);
      return () => clearTimeout(t);
    } else {
      setLoad(false);
    }
  }, [active]);

  if (!active) return <Home />;

  return (
    <>
      {/* Loading overlay */}
      {!load && (
        <div className="app-loading">
          <h1 className="loading-title">טוען את הספרייה</h1>
          <Spinner size="lg" />
        </div>
      )}

      {/* App */}
      {load && (
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/books" element={<Layout><Books /></Layout>} />
            <Route path="/clients" element={<Layout><Clients /></Layout>} />
            <Route path="/loans" element={<Layout><Loans /></Layout>} />
          </Routes>
        </Router>
      )}
    </>
  );
};

export default Main;
