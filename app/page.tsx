"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  receiptName?: string;
};

type CategoryLimit = {
  name: string;
  limit: number;
};

const defaultCategories: CategoryLimit[] = [
  { name: "Mat", limit: 4500 },
  { name: "Boende", limit: 9500 },
  { name: "Transport", limit: 1200 },
  { name: "Nöje", limit: 1600 },
  { name: "Hälsa", limit: 900 },
  { name: "Övrigt", limit: 1000 },
];

const initialExpenses: Expense[] = [];
const storageKey = "smartbudgetse:v3";

const currency = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currency.format(value || 0);
}

function getMonthName(value: string) {
  const date = new Date(`${value}-01T12:00:00`);
  return date.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
}

export default function Home() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [income, setIncome] = useState(33000);
  const [savingsGoal, setSavingsGoal] = useState(4500);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories, setCategories] = useState<CategoryLimit[]>(defaultCategories);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Alla");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      const data = JSON.parse(saved);
      setMonth(data.month ?? currentMonth);
      setIncome(data.income ?? 33000);
      setSavingsGoal(data.savingsGoal ?? 4500);
      setExpenses(data.expenses ?? initialExpenses);
      setCategories(data.categories ?? defaultCategories);
    }
    setIsLoaded(true);
  }, [currentMonth]);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ month, income, savingsGoal, expenses, categories }));
  }, [categories, expenses, income, isLoaded, month, savingsGoal]);

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => expense.date.startsWith(month)),
    [expenses, month],
  );

  const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = categories.reduce((sum, category) => sum + category.limit, 0);
  const leftAfterSpending = income - totalSpent;
  const availableAfterGoal = income - savingsGoal - totalSpent;
  const budgetProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const filteredExpenses = monthExpenses.filter((expense) => {
    const matchesQuery = `${expense.title} ${expense.note}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesCategory = categoryFilter === "Alla" || expense.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const spendingByCategory = categories.map((category) => {
    const spent = monthExpenses
      .filter((expense) => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    return {
      ...category,
      spent,
      remaining: category.limit - spent,
      progress: category.limit > 0 ? Math.min((spent / category.limit) * 100, 100) : 0,
    };
  });

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const receipt = form.get("receipt") as File | null;
    const nextExpense: Expense = {
      id: crypto.randomUUID(),
      title: String(form.get("title") || "Ny utgift"),
      amount: Number(form.get("amount") || 0),
      category: String(form.get("category") || "Övrigt"),
      date: String(form.get("date") || new Date().toISOString().slice(0, 10)),
      note: String(form.get("note") || ""),
      receiptName: receipt?.name || undefined,
    };

    setExpenses((current) => [nextExpense, ...current]);
    event.currentTarget.reset();
  }

  function removeExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id));
  }

  function updateCategoryLimit(name: string, limit: number) {
    setCategories((current) =>
      current.map((category) => (category.name === name ? { ...category, limit } : category)),
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">SmartBudgetSE</p>
          <h1>En enkel svensk budgetapp för vardagskoll.</h1>
          <p className="lead">
            Följ inkomster, utgifter, kvitton och kategoribudgetar på ett ställe. All data sparas
            lokalt i webbläsaren.
          </p>
        </div>
        <div className="month-card" aria-label="Vald månad">
          <label htmlFor="month">Månad</label>
          <input id="month" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          <strong>{getMonthName(month)}</strong>
        </div>
      </section>

      <section className="summary-grid" aria-label="Sammanfattning">
        <article className="metric">
          <span>Inkomst</span>
          <input
            aria-label="Månadsinkomst"
            type="number"
            min="0"
            value={income}
            onChange={(event) => setIncome(Number(event.target.value))}
          />
        </article>
        <article className="metric">
          <span>Utgifter</span>
          <strong>{formatCurrency(totalSpent)}</strong>
        </article>
        <article className="metric">
          <span>Kvar efter utgifter</span>
          <strong className={leftAfterSpending < 0 ? "danger" : "success"}>
            {formatCurrency(leftAfterSpending)}
          </strong>
        </article>
        <article className="metric">
          <span>Sparmål</span>
          <input
            aria-label="Sparmål"
            type="number"
            min="0"
            value={savingsGoal}
            onChange={(event) => setSavingsGoal(Number(event.target.value))}
          />
        </article>
      </section>

      <section className="budget-band">
        <div>
          <span>Budgetstatus</span>
          <strong>
            {formatCurrency(totalSpent)} av {formatCurrency(totalBudget)}
          </strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${budgetProgress}%` }} />
        </div>
        <p className={availableAfterGoal < 0 ? "danger" : "success"}>
          {availableAfterGoal >= 0
            ? `${formatCurrency(availableAfterGoal)} kvar efter sparmål`
            : `${formatCurrency(Math.abs(availableAfterGoal))} över plan efter sparmål`}
        </p>
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Registrera</p>
              <h2>Lägg till utgift</h2>
            </div>
          </div>
          <form className="expense-form" onSubmit={addExpense}>
            <label>
              Beskrivning
              <input name="title" placeholder="Ex. lunch, hyra, apotek" required />
            </label>
            <label>
              Belopp
              <input name="amount" type="number" min="1" step="1" placeholder="0" required />
            </label>
            <label>
              Kategori
              <select name="category">
                {categories.map((category) => (
                  <option key={category.name}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              Datum
              <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </label>
            <label className="wide">
              Anteckning
              <input name="note" placeholder="Butik, betalmetod eller kommentar" />
            </label>
            <label className="wide">
              Kvitto
              <input name="receipt" type="file" accept="image/*,.pdf" />
            </label>
            <button type="submit">Spara utgift</button>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Kategorier</p>
              <h2>Budget per område</h2>
            </div>
          </div>
          <div className="category-list">
            {spendingByCategory.map((category) => (
              <article key={category.name} className="category-row">
                <div>
                  <strong>{category.name}</strong>
                  <span>
                    {formatCurrency(category.spent)} använt / {formatCurrency(category.remaining)} kvar
                  </span>
                </div>
                <input
                  aria-label={`Budget för ${category.name}`}
                  type="number"
                  min="0"
                  value={category.limit}
                  onChange={(event) => updateCategoryLimit(category.name, Number(event.target.value))}
                />
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${category.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="section-heading list-heading">
          <div>
            <p className="eyebrow">Historik</p>
            <h2>Utgifter och kvitton</h2>
          </div>
          <div className="filters">
            <input
              aria-label="Sök utgifter"
              placeholder="Sök"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              aria-label="Filtrera kategori"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>Alla</option>
              {categories.map((category) => (
                <option key={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="expense-list">
          {filteredExpenses.length === 0 ? (
            <p className="empty-state">Inga utgifter matchar filtret för den här månaden.</p>
          ) : (
            filteredExpenses.map((expense) => (
              <article key={expense.id} className="expense-row">
                <div>
                  <strong>{expense.title}</strong>
                  <span>
                    {expense.category} / {new Date(`${expense.date}T12:00:00`).toLocaleDateString("sv-SE")}
                    {expense.receiptName ? ` / ${expense.receiptName}` : ""}
                  </span>
                  {expense.note ? <p>{expense.note}</p> : null}
                </div>
                <strong>{formatCurrency(expense.amount)}</strong>
                <button type="button" onClick={() => removeExpense(expense.id)} aria-label={`Ta bort ${expense.title}`}>
                  Ta bort
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
