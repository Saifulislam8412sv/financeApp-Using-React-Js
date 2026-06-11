import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const CATEGORIES = ["Food", "Transport", "Utilities", "Shopping", "Health", "Entertainment", "Salary", "Freelance", "Other"];

const emptyForm = { description: "", amount: "", type: "expense", category: "Other", date: new Date().toISOString().slice(0, 10) };

export default function Dashboard() {
  const { user, logout } = useAuth();

  const storageKey = `finance_txns_${user.id}`;

  const [transactions, setTransactions] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
  }, [transactions, storageKey]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) { setError("Enter a valid positive amount."); return; }

    if (editId !== null) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editId ? { ...t, ...form, amount: parseFloat(form.amount) } : t
        )
      );
      setEditId(null);
    } else {
      const newTxn = { id: Date.now(), ...form, amount: parseFloat(form.amount) };
      setTransactions((prev) => [newTxn, ...prev]);
    }
    setForm(emptyForm);
  };

  const startEdit = (txn) => {
    setEditId(txn.id);
    setForm({ description: txn.description, amount: String(txn.amount), type: txn.type, category: txn.category, date: txn.date });
    setError("");
  };

  const cancelEdit = () => { setEditId(null); setForm(emptyForm); setError(""); };

  const deleteTxn = (id) => {
    if (window.confirm("Delete this transaction?"))
      setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const fmt = (n) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0 });

  const filtered = filterType === "all" ? transactions : transactions.filter((t) => t.type === filterType);

  return (
    <div className="dash-wrapper">
      <div className="dash-container">
        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="logo">💰</span>
            <div>
              <div className="app-name">My Finance</div>
              <div className="user-name">Hi, {user.name} 👋</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

        {/* Summary cards */}
        <div className="metrics">
          <div className="metric">
            <div className="metric-label">Balance</div>
            <div className={`metric-value ${balance >= 0 ? "positive" : "negative"}`}>{fmt(balance)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Total income</div>
            <div className="metric-value positive">{fmt(totalIncome)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Total expenses</div>
            <div className="metric-value negative">{fmt(totalExpense)}</div>
          </div>
        </div>

        {/* Add / Edit form */}
        <div className="form-card">
          <h2 className="form-card-title">{editId ? "✏️ Edit transaction" : "➕ Add transaction"}</h2>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="field">
                <label>Description</label>
                <input name="description" placeholder="e.g. Salary, Groceries…" value={form.description} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Amount (₹)</label>
                <input name="amount" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="field">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} />
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-submit" type="submit">
                {editId ? "Update transaction" : "Add transaction"}
              </button>
              {editId && (
                <button className="btn-cancel" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Transaction list */}
        <div className="txn-section">
          <div className="txn-header">
            <h2 className="txn-title">Transactions</h2>
            <div className="filter-tabs">
              {["all", "income", "expense"].map((f) => (
                <button key={f} className={`filter-tab ${filterType === f ? "active" : ""}`} onClick={() => setFilterType(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">No transactions yet. Add one above.</div>
          ) : (
            <div className="txn-list">
              {filtered.map((t) => (
                <div key={t.id} className={`txn-row ${editId === t.id ? "editing" : ""}`}>
                  <div className="txn-left">
                    <span className="txn-desc">{t.description}</span>
                    <span className="txn-meta">{t.category} · {t.date}</span>
                  </div>
                  <div className="txn-right">
                    <span className={`txn-amount ${t.type}`}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </span>
                    <button className="icon-btn edit" onClick={() => startEdit(t)} title="Edit">✏️</button>
                    <button className="icon-btn delete" onClick={() => deleteTxn(t.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
