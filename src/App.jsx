import { useState, useEffect } from "react";
import { transactions as initialData } from "./data";
import {LineChart,Line,XAxis,YAxis,Tooltip,PieChart,Pie,Cell, ResponsiveContainer,} from "recharts";

export default function App() {
  const [role, setRole] = useState("viewer");

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("tx");
    return saved ? JSON.parse(saved) : initialData;
  });

  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    localStorage.setItem("tx", JSON.stringify(transactions));
  }, [transactions]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + t.amount, 0);

  const balance = income - expense;

  const chartData = transactions.map((t) => ({
    date: t.date.slice(5),
    amount: t.amount,
  }));

  const categoryMap = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + t.amount;
    }
  });

  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  const COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#facc15"];

  const filtered = transactions.filter((t) =>
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const highestCategory =
    [...pieData].sort((a, b) => b.value - a.value)[0];

  const addDummy = () => {

  // CSV Export Function
    const exportCSV = () => {
  const headers = ["date", "category", "amount", "type"];

  const rows = transactions.map((t) =>
    [t.date, t.category, t.amount, t.type].join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
};

    const newTx = {
      id: Date.now(),
      date: "2026-03-10",
      amount: 700,
      category: "Food",
      type: "expense",
    };
    setTransactions([newTx, ...transactions]);
  };

  const cardStyle = dark
  ? "bg-neutral-900 text-white"
  : "bg-white text-black border border-gray-200";

const inputStyle = dark
  ? "bg-neutral-800 text-white"
  : "bg-white text-black border border-gray-300";


  return (
   <div className={`min-h-screen px-6 py-7 ${
  dark ? "bg-neutral-950 text-white" : "bg-gray-100 text-black"
}`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-xl font-medium">Spending Journal</h1>
          <p className="text-xs text-gray-500">
            simple overview of your money
          </p>
        </div>

        <div className="flex gap-2 items-center">
       <button
  onClick={() => setDark(!dark)}
  className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
    dark ? "bg-neutral-800" : "bg-gray-200"
  }`}
>
  <span>{dark ? "🌙" : "☀️"}</span>
  <span>{dark ? "dark" : "light"}</span>
</button>

          {role === "admin" && (
            <button
              onClick={addDummy}
              className="bg-green-500 px-3 py-1 rounded text-black text-sm"
            >
              add
            </button>
          )}

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-neutral-800 px-2 py-1 rounded text-sm"
          >
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
    <div className={`${cardStyle} p-4 rounded`}>
          <p className="text-xs text-gray-400">balance</p>
          <h2 className="text-lg mt-1">₹ {balance}</h2>
        </div>

        <div className={`${cardStyle} p-4 rounded`}>
          <p className="text-xs text-gray-400">income</p>
          <h2 className="text-lg text-green-400 mt-1">₹ {income}</h2>
        </div>

        <div className={`${cardStyle} p-4 rounded`}>
          <p className="text-xs text-gray-400">expenses</p>
          <h2 className="text-lg text-red-400 mt-1">₹ {expense}</h2>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6 mt-7">

        <div className="bg-neutral-900 p-4 rounded">
          <p className="text-xs text-gray-400 mb-2">trend</p>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-neutral-900 p-4 rounded">
          <p className="text-xs text-gray-400 mb-2">categories</p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* INSIGHTS */}
      <div className="mt-7">
        <p className="text-sm mb-2">insights</p>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">nothing to show</p>
        ) : (
          <div className="text-sm space-y-1 text-gray-300">
            <p>most spent: {highestCategory?.name}</p>
            <p>total entries: {transactions.length}</p>
            <p>
              status:{" "}
              {balance >= 0 ? "saving 👍" : "spending too much 👀"}
            </p>
          </div>
        )}
      </div>

      {/* TRANSACTIONS */}
      <div className="mt-8">
        <div className="flex justify-between mb-2">
          <p className="text-sm">transactions</p>

          <input
            placeholder="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
           className={`${inputStyle} px-2 py-1 rounded text-sm`}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">no results</p>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
           className={`flex justify-between py-2 border-b text-sm ${
  dark ? "border-neutral-800" : "border-gray-300"
}`}
            >
              <span>{t.category}</span>
              <span>{t.date}</span>
              <span
                className={
                  t.type === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                ₹ {t.amount}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}