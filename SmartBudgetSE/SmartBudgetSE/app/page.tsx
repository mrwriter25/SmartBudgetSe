
export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>SmartBudgetSE</h1>
      <p>Din svenska budgetapp.</p>

      <div style={{
        marginTop: 20,
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12
      }}>
        <h2>Totala utgifter</h2>
        <p>0 kr</p>
      </div>

      <div style={{
        marginTop: 20,
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12
      }}>
        <h2>Kvitton</h2>
        <input type="file" />
      </div>
    </main>
  );
}
