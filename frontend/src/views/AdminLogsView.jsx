import React, { useState, useEffect } from 'react';
import { getCollection } from '../api/client';
import Button from '../components/common/Button';
import SearchInput from '../components/common/SearchInput';
import { ShieldCheck, Download, Filter, Inbox } from 'lucide-react';

export default function AdminLogsView() {
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = getCollection('audit_logs');
    setLogs(data);
    setLoading(false);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchType = log.target_type.toLowerCase().includes(q);
      const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
      return matchAction || matchType || matchDetails;
    }
    return true;
  });

  const downloadCSV = () => {
    const headers = ['ID', 'User ID', 'Action', 'Target Type', 'Target ID', 'IP Address', 'Timestamp', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.user_id,
      l.action,
      l.target_type,
      l.target_id,
      l.ip_address,
      l.created_at,
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `linkhub_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const actionTypes = ['ALL', 'LOGIN', 'REGISTER', 'CREATE_TEAM', 'JOIN_TEAM', 'CREATE_LINK', 'CREATE_TASK', 'UPDATE_TASK_STATUS'];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} color="var(--color-action)" /> Admin Audit Logs
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Security events, auth entries, squad transactions, and user audit trails.
          </p>
        </div>

        <Button variant="primary" onClick={downloadCSV} icon={Download} disabled={filteredLogs.length === 0}>
          Export CSV
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search action, type or details..." />
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 14px' }}
          >
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act === 'ALL' ? 'Filter: All Actions' : act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="state-box">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="state-box">
          <Inbox size={40} style={{ opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No audit logs found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: 'var(--card-border-width) solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
                <th style={{ padding: '12px 16px' }}>Action</th>
                <th style={{ padding: '12px 16px' }}>Target</th>
                <th style={{ padding: '12px 16px' }}>User ID</th>
                <th style={{ padding: '12px 16px' }}>Details</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    <span className="badge">{log.action}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{log.target_type} #{log.target_id}</td>
                  <td style={{ padding: '12px 16px' }}>User #{log.user_id}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {JSON.stringify(log.details)}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-subtle)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
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
