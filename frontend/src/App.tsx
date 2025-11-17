import React, { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";

type LeaderboardRow = {
  Model: string;
  Organization: string;
  "Global Average": number;
  "Reasoning Average": number;
  "Coding Average": number;
  "Agentic Coding Average": number;
  "Mathematics Average": number;
  "Data Analysis Average": number;
  "Language Average": number;
  "IF Average": number;
};

const cellStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  padding: "8px 10px",
  textAlign: "left",
  fontSize: 13,
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontWeight: 600,
  background: "#f9fafb",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.04,
};

const App: React.FC = () => {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [liveQuery, setLiveQuery] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [minGlobal, setMinGlobal] = useState<number>(0);

  useEffect(() => {
    fetch("http://localhost:8000/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => {
        setRows([]);
        setLoading(false);
      });
  }, []);

  const debouncedSetQuery = useMemo(
    () =>
      debounce((v: string) => {
        setQuery(v);
      }, 200),
    []
  );

  const onSearchChange = (v: string) => {
    setLiveQuery(v);
    debouncedSetQuery(v);
  };

  const organizations = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.Organization));
    return Array.from(set).sort();
  }, [rows]);

  const maxGlobal = useMemo(() => {
    if (!rows.length) return 100;
    return Math.ceil(
      rows.reduce((m, r) => Math.max(m, r["Global Average"] || 0), 0)
    );
  }, [rows]);

  useEffect(() => {
    if (rows.length) {
      setMinGlobal(0);
    }
  }, [rows.length]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = query.toLowerCase().trim();
      const passesSearch =
        !q ||
        r.Model.toLowerCase().includes(q) ||
        r.Organization.toLowerCase().includes(q);
      const passesOrg = orgFilter === "all" || r.Organization === orgFilter;
      const passesGlobal = (r["Global Average"] || 0) >= minGlobal;
      return passesSearch && passesOrg && passesGlobal;
    });
  }, [rows, query, orgFilter, minGlobal]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background:
            "radial-gradient(circle at top left, #eef2ff, #f9fafb 50%, #ecfeff)",
        }}
      >
        Loading Live Bench...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #eef2ff, #f9fafb 50%, #ecfeff)",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          background: "white",
          borderRadius: 16,
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.07), 0 0 0 1px rgba(148, 163, 184, 0.3)",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: -0.03,
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <span>Live Bench</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280" }}>
              for your fav LLM
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Explore benchmark scores across models. Filter by model, org, and
            performance.
          </div>
        </div>

        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 220px", minWidth: 0 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.06,
                color: "#6b7280",
                marginBottom: 4,
              }}
            >
              Search
            </label>
            <input
              value={liveQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by model or organization..."
              style={{
                width: "100%",
                padding: "7px 10px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          <div style={{ flex: "0 0 220px" }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.06,
                color: "#6b7280",
                marginBottom: 4,
              }}
            >
              Organization
            </label>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                fontSize: 13,
                outline: "none",
                backgroundColor: "white",
              }}
            >
              <option value="all">All organizations</option>
              {organizations.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "0 0 230px" }}>
            <label
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.06,
                color: "#6b7280",
                marginBottom: 2,
              }}
            >
              <span>Min Global Avg</span>
              <span style={{ fontWeight: 500, color: "#4b5563" }}>
                {minGlobal.toFixed(0)}
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={maxGlobal}
              step={1}
              value={minGlobal}
              onChange={(e) => setMinGlobal(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ maxHeight: "70vh", overflow: "auto" }}>
          <table
            style={{
              borderCollapse: "separate",
              borderSpacing: 0,
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th style={headerCellStyle}>Model</th>
                <th style={headerCellStyle}>Organization</th>
                <th style={headerCellStyle}>Global Avg</th>
                <th style={headerCellStyle}>Reasoning</th>
                <th style={headerCellStyle}>Coding</th>
                <th style={headerCellStyle}>Agentic Coding</th>
                <th style={headerCellStyle}>Math</th>
                <th style={headerCellStyle}>Data Analysis</th>
                <th style={headerCellStyle}>Language</th>
                <th style={headerCellStyle}>IF</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "#eff6ff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      i % 2 === 0 ? "#ffffff" : "#f9fafb";
                  }}
                >
                  <td style={{ ...cellStyle, fontWeight: 600 }}>
                    {r["Model"]}
                  </td>
                  <td style={cellStyle}>{r["Organization"]}</td>
                  <td style={cellStyle}>{r["Global Average"]}</td>
                  <td style={cellStyle}>{r["Reasoning Average"]}</td>
                  <td style={cellStyle}>{r["Coding Average"]}</td>
                  <td style={cellStyle}>{r["Agentic Coding Average"]}</td>
                  <td style={cellStyle}>{r["Mathematics Average"]}</td>
                  <td style={cellStyle}>{r["Data Analysis Average"]}</td>
                  <td style={cellStyle}>{r["Language Average"]}</td>
                  <td style={cellStyle}>{r["IF Average"]}</td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      padding: "18px 10px",
                      color: "#9ca3af",
                    }}
                    colSpan={10}
                  >
                    No models match your filters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
