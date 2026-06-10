import { useState } from "react";
 
interface Scores {
  maintainability_before: number;
  maintainability_after: number;
  complexity_before: number;
  complexity_after: number;
  readability_before: number;
  readability_after: number;
}
 
interface RefactorResult {
  original_code: string;
  refactored_code: string;
  changes: string[];
  summary: string;
  scores: Scores;
}
 
function ScoreRow({ label, before, after, lowerIsBetter = false }: {
  label: string;
  before: number;
  after: number;
  lowerIsBetter?: boolean;
}) {
  const improved = lowerIsBetter ? after < before : after > before;
  const arrow = improved ? "▲" : "▼";
  const color = improved ? "green" : "red";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
      <span style={{ width: "140px" }}>{label}</span>
      <span style={{ color: "gray" }}>{before}</span>
      <span>→</span>
      <span style={{ color, fontWeight: "bold" }}>{after} {arrow}</span>
    </div>
  );
}
 
function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState<RefactorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState<boolean[]>([]);
 
  const handleRefactor = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setResult(data);
      setAccepted(new Array(data.changes.length).fill(false));
    } catch (e) {
      alert("Error connecting to backend");
    }
    setLoading(false);
  };
 
  const acceptedCount = accepted.filter(Boolean).length;
 
  return (
    <div style={{ fontFamily: "monospace", padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🔧 LegacyLens — AI Code Refactoring</h1>
      <p>Powered by Claude (Anthropic)</p>
 
      <div style={{ marginBottom: "16px" }}>
        <label>Language: </label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
        </select>
      </div>
 
      <textarea
        rows={10}
        style={{ width: "100%", fontSize: "14px", padding: "8px" }}
        placeholder="Paste your legacy code here..."
        value={code}
        onChange={e => setCode(e.target.value)}
      />
 
      <button
        onClick={handleRefactor}
        disabled={loading || !code}
        style={{ marginTop: "8px", padding: "10px 24px", fontSize: "16px", cursor: "pointer" }}
      >
        {loading ? "Analyzing..." : "Refactor with Claude"}
      </button>
 
      {result && (
        <div style={{ marginTop: "32px" }}>
          <h2>Summary</h2>
          <p>{result.summary}</p>
 
          {result.scores && (
            <div style={{ marginBottom: "24px", padding: "16px", background: "#f9f9f9", borderRadius: "4px" }}>
              <h3>Refactoring Score</h3>
              <ScoreRow label="Maintainability" before={result.scores.maintainability_before} after={result.scores.maintainability_after} />
              <ScoreRow label="Complexity" before={result.scores.complexity_before} after={result.scores.complexity_after} lowerIsBetter />
              <ScoreRow label="Readability" before={result.scores.readability_before} after={result.scores.readability_after} />
            </div>
          )}
 
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <h3>Original Code</h3>
              <pre style={{ background: "#fee", padding: "12px", borderRadius: "4px" }}>
                {result.original_code}
              </pre>
            </div>
            <div>
              <h3>Refactored Code</h3>
              <pre style={{ background: "#efe", padding: "12px", borderRadius: "4px" }}>
                {result.refactored_code}
              </pre>
            </div>
          </div>
 
          <h3>
            Changes (Human-in-the-Loop Review) — {acceptedCount} / {result.changes.length} Accepted
          </h3>
 
          {result.changes.map((change, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span>{accepted[i] ? "✓" : "✗"} {change}</span>
              <button
                onClick={() => {
                  const updated = [...accepted];
                  updated[i] = !updated[i];
                  setAccepted(updated);
                }}
                style={{
                  background: accepted[i] ? "green" : "gray",
                  color: "white",
                  border: "none",
                  padding: "4px 12px",
                  cursor: "pointer"
                }}
              >
                {accepted[i] ? "✓ Accepted" : "Accept"}
              </button>
            </div>
          ))}
 
          {acceptedCount > 0 && (
            <div style={{ marginTop: "24px", padding: "16px", background: "#f5f5f5", borderRadius: "4px" }}>
              <h3>Refactoring Report</h3>
              <p><strong>Accepted ({acceptedCount}):</strong></p>
              {result.changes.map((change, i) => accepted[i] && (
                <p key={i} style={{ color: "green", margin: "4px 0" }}>✓ {change}</p>
              ))}
              <p><strong>Rejected ({result.changes.length - acceptedCount}):</strong></p>
              {result.changes.map((change, i) => !accepted[i] && (
                <p key={i} style={{ color: "red", margin: "4px 0" }}>✗ {change}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
export default App;