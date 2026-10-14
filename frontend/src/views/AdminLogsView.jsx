import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import Button from "../components/common/Button";
import SearchInput from "../components/common/SearchInput";
import { ShieldCheck, Download, Inbox } from "lucide-react";

export default function AdminLogsView() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/admin/logs");

        if (active) {
          setLogs(Array.isArray(data) ? data : data.logs || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load audit logs.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      active = false;
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== "ALL" && log.action !== actionFilter) {
      return false;
    }

    const query = search.trim().toLowerCase();

    if (!query) return true;

    const action = String(log.action || "").toLowerCase();
    const targetType = String(log.target_type || "").toLowerCase();
    const details = JSON.stringify(log.details || {}).toLowerCase();

    return (
      action.includes(query) ||
      targetType.includes(query) ||
      details.includes(query)
    );
  });

  const downloadCSV = async () => {
    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

      const token = sessionStorage.getItem("linkhub_token");

      const response = await fetch(`${baseUrl}/admin/logs/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.message || "Unable to export audit logs.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `linkhub_audit_logs_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || "Unable to export audit logs.");
    }
  };

  const actionTypes = [
    "ALL",
    ...new Set(logs.map((log) => log.action).filter(Boolean)),
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 800,
              fontFamily: "var(--font-heading)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldCheck size={28} color="var(--color-action)" />
            Admin Audit Logs
          </h1>

          <p
            style={{
              color: "var(--color-text-muted)",
              marginTop: "4px",
            }}
          >
            Security events, auth entries, squad transactions, and user audit
            trails.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={downloadCSV}
          icon={Download}
          disabled={filteredLogs.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="state-box" role="alert">
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px" }}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search action, type or details..."
          />
        </div>

        <div style={{ minWidth: "160px" }}>
          <select
            className="input"
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            style={{
              borderRadius: "var(--radius-full)",
              padding: "8px 14px",
            }}
          >
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {action === "ALL" ? "Filter: All Actions" : action}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="state-box">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="state-box">
          <Inbox size={40} style={{ opacity: 0.6, marginBottom: "12px" }} />

          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            No audit logs found
          </h3>

          <p style={{ fontSize: "0.88rem", marginTop: "4px" }}>
            {error
              ? "Check that you are logged in with an administrator account."
              : "Try adjusting your filters or search query."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom:
                    "var(--card-border-width) solid var(--color-border)",
                  backgroundColor: "var(--color-surface-subtle)",
                }}
              >
                <th style={{ padding: "12px 16px" }}>Action</th>
                <th style={{ padding: "12px 16px" }}>Target</th>
                <th style={{ padding: "12px 16px" }}>User ID</th>
                <th style={{ padding: "12px 16px" }}>Details</th>
                <th style={{ padding: "12px 16px" }}>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                    <span className="badge">{log.action}</span>
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    {log.target_type || "—"} #{log.target_id ?? "—"}
                  </td>

                  <td style={{ padding: "12px 16px" }}>
                    User #{log.user_id ?? "—"}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-muted)",
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                    }}
                  >
                    {JSON.stringify(log.details || {})}
                  </td>

                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--color-text-subtle)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
