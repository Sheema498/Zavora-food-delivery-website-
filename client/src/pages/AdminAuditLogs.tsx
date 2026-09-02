import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService.js';
import { AuditLog } from '../types/index.js';
import { formatDateTime } from '../utils/formatters.js';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAuditLogs(1, 50, actionFilter || undefined);
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Security & Operational Audit Trail</h1>
          <p className="text-xs text-slate-500">
            Immutable system activity log recording all user logins, order dispatches, status changes & moderation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Filter action (e.g. ORDER, LOGIN)..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500 font-mono text-[11px]">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase border border-purple-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{log.resource}</td>
                    <td className="p-4 text-slate-700">
                      {log.user ? `${log.user.name} (${log.user.role})` : 'System / Guest'}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                      {log.metadataJson || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
