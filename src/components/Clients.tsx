import React, { useEffect, useMemo, useState } from "react";
import "../LoginPage/css/modern.css";
import { selectLoan } from '../slices/LoansSlice';
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectAccess } from "../slices/loginSlice";
import {
  getClientsAsync,
  addClientAsync,
  deleteClientAsync,
  updateClientAsync,
  selectClient,
  selectRefresh,
} from "../slices/ClientsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Condition = "all" | boolean;

const Clients = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClient) as any[]; // לפי הסלייס שלך
  const refresh = useAppSelector(selectRefresh);
  const access = useAppSelector(selectAccess);
  const loans = useAppSelector(selectLoan);

  // filters
  const [condition, setCondition] = useState<Condition>("all");
  const [search, setSearch] = useState("");

  // form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [age, setAge] = useState<number>(0);
  const [city, setCity] = useState("");

  // fetch
  useEffect(() => {
    if (!access) return;
    dispatch(getClientsAsync(access));
  }, [dispatch, access, refresh]);

  const filteredClients = useMemo(() => {
    const byCondition =
      condition === "all"
        ? clients
        : clients.filter((c) => c.clientStatus === condition);

    const q = search.trim().toLowerCase();
    if (!q) return byCondition;

    return byCondition.filter((c) =>
      String(c.clientName ?? "").toLowerCase().includes(q)
    );
  }, [clients, condition, search]);

  function resetForm() {
    setEditingId(null);
    setClientName("");
    setAge(0);
    setCity("");
  }

  function openAddForm() {
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(client: any) {
    setEditingId(client.id);
    setClientName(client.clientName ?? "");
    setAge(Number(client.age ?? 0));
    setCity(client.city ?? "");
    setIsFormOpen(true);
  }

  function handleSubmit() {
    if (!access) return;

    // add
    if (editingId === null) {
      dispatch(
        addClientAsync({
          client: { clientName, age, city, clientStatus: true },
          access,
        })
      );

      toast("Client was added", {
        position: "top-right",
        autoClose: 4000,
        type: "success",
        theme: "colored",
      });

      resetForm();
      setIsFormOpen(false);
      return;
    }

    // update
    dispatch(
      updateClientAsync({
        client: {
          id: editingId,
          clientName,
          age,
          city,
          // משאירים סטטוס כמו אצלך (בשרת/סלייס). אם חייבים:
          // clientStatus: clients.find(c => c.id === editingId)?.clientStatus
        },
        access,
      })
    );

    toast("Client was updated", {
      position: "top-right",
      autoClose: 4000,
      type: "success",
      theme: "colored",
    });

    resetForm();
    setIsFormOpen(false);
  }

  // בקוד 1: deleteClientAsync = toggle Available/Disabled
  function toggleClientStatus(client: any) {
    if (!access) return;

    dispatch(
      deleteClientAsync({
        client: {
          id: client.id,
          clientName: client.clientName,
          age: client.age,
          city: client.city,
          clientStatus: !client.clientStatus,
        },
        access,
      })
    );

    toast(client.clientStatus ? "Client disabled" : "Client available", {
      position: "top-right",
      autoClose: 3000,
      type: "info",
      theme: "colored",
    });
  }

  function makeFakeIsraeliPhone() {
  // 05X-XXXXXXX
  const prefix = ["050","052","053","054","055","058"][Math.floor(Math.random()*6)];
  const rest = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
  return `${prefix}-${rest}`;
}

const countActiveLoans = (clientId: number) => {
  return loans.filter(
    loan =>
      loan.clientID.id === clientId &&
      loan.loanStatus === false
  ).length;
};

function getClientPhoneLocal(clientId: number) {
  const key = `fake_phone_client_${clientId}`;
  const saved = localStorage.getItem(key);
  if (saved) return saved;

  const phone = makeFakeIsraeliPhone();
  localStorage.setItem(key, phone);
  return phone;
}

type SortKey = 'name' | 'openLoans' | 'status' | null;
type SortDir = 'asc' | 'desc';

const [sortKey, setSortKey] = useState<SortKey>(null);
const [sortDir, setSortDir] = useState<SortDir>('asc');

const toggleSort = (key: Exclude<SortKey, null>) => {
  if (sortKey === key) {
    setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortKey(key);
    setSortDir('asc');
  }
};

 const sortedClients = filteredClients.slice().sort((a: any, b: any) => {
  if (!sortKey) return 0;

  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortKey === 'openLoans') {
    const aCount = countActiveLoans(a.id);
    const bCount = countActiveLoans(b.id);
    return (aCount - bCount) * dir;
  }

  if (sortKey === 'name') {
    return a.clientName.localeCompare(b.clientName, 'he') * dir;
  }

  if (sortKey === 'status') {
    // פעיל קודם או הפוך – לפי dir
    const aVal = a.clientStatus ? 1 : 0;
    const bVal = b.clientStatus ? 1 : 0;
    return (aVal - bVal) * dir;
  }

  return 0;
});

  return (
    <div className="card" style={{ direction: "rtl" }}>
      <ToastContainer />

      {/* Header */}
      <div className="card-header">
        <h2 className="card-title">כל הלקוחות ({filteredClients.length})</h2>

        <button
          className="btn-primary"
          onClick={() => (isFormOpen ? setIsFormOpen(false) : openAddForm())}
          type="button"
        >
          {isFormOpen ? "✖️ סגור" : "➕ הוסף לקוח חדש"}
        </button>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <button
          className={`btn-small secondary ${condition === "all" ? "success" : ""}`}
          onClick={() => setCondition("all")}
          type="button"
        >
          כל הלקוחות
        </button>

        <button
          className={`btn-small secondary ${condition === true ? "success" : ""}`}
          onClick={() => setCondition(true)}
          type="button"
        >
          לקוחות זמינים
        </button>

        <button
          className={`btn-small secondary ${condition === false ? "warning" : ""}`}
          onClick={() => setCondition(false)}
          type="button"
        >
          לקוחות מושבתים
        </button>

        <div style={{ flex: 1, minWidth: 240 }}>
          <input
            className="form-input"
            placeholder="חיפוש לפי שם לקוח..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Form (Add/Edit) */}
      {isFormOpen && (
        <div className="login-form" style={{ maxWidth: 999, marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">שם מלא</label>
            <input
              className="form-input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="הקלד שם לקוח"
            />
          </div>

          <div className="form-group">
            <label className="form-label">גיל</label>
            <input
              className="form-input"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder="לדוגמה: 25"
              type="number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">עיר</label>
            <input
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="לדוגמה: תל אביב"
            />
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
              <th onClick={() => toggleSort('name')} className="sortable-th">
  <span className="th-content">
    שם מלא
    <span className={`sort-icon ${sortKey === 'name' ? 'active' : ''}`}>
      {sortKey === 'name'
        ? sortDir === 'asc'
          ? '▲'
          : '▼'
        : '⇅'}
    </span>
  </span>
</th>


<th>טלפון</th>

<th onClick={() => toggleSort('openLoans')} className="sortable-th">
  <span className="th-content">
    השאלות פתוחות
    <span className={`sort-icon ${sortKey === 'openLoans' ? 'active' : ''}`}>
      {sortKey === 'openLoans'
        ? sortDir === 'asc'
          ? '▲'
          : '▼'
        : '⇅'}
    </span>
  </span>
</th>


<th onClick={() => toggleSort('status')} className="sortable-th">
  <span className="th-content">
    סטטוס
    <span className={`sort-icon ${sortKey === 'status' ? 'active' : ''}`}>
      {sortKey === 'status'
        ? sortDir === 'asc'
          ? '▲'
          : '▼'
        : '⇅'}
    </span>
  </span>
</th>


<th>פעולות</th>

            </tr>
          </thead>

          <AnimatePresence initial={false}>
  <motion.tbody layout>
    {sortedClients.map((client: any) => {
      const phone = getClientPhoneLocal(client.id);
      const statusText = client.clientStatus ? "פעיל" : "לא פעיל";
      const statusClass = client.clientStatus ? "success" : "inactive";

      return (
        <motion.tr
          key={client.id}
          layout
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          <td>{client.clientName}</td>
          <td>{phone}</td>

          <td>
            <span className={`books-count-badge ${countActiveLoans(client.id) > 0 ? 'active' : 'inactive'}`}>
              {countActiveLoans(client.id)}
            </span>
          </td>

          <td>
            <span className={`status-badge ${statusClass}`}>{statusText}</span>
          </td>

          <td>
            <button className="btn-small edit" onClick={() => openEditForm(client)} type="button">
              ✏️ ערוך
            </button>

            <button
              className={`btn-small ${client.clientStatus ? "secondary" : "warning"}`}
              onClick={() => toggleClientStatus(client)}
              type="button"
              title={client.clientStatus ? "השבת לקוח" : "הפעל לקוח"}
            >
              {client.clientStatus ? "🚫 השבת" : "✅ הפעל"}
            </button>
          </td>
        </motion.tr>
      );
    })}
  </motion.tbody>
</AnimatePresence>

        </table>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>אין לקוחות במערכת</h3>
          <p>נסי לשנות חיפוש/סינון או להוסיף לקוח חדש</p>
          <button className="btn-primary" onClick={openAddForm} type="button">
            הוסף לקוח ראשון
          </button>
        </div>
      )}
    </div>
  );
};

export default Clients;
