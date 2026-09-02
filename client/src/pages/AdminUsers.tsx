import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService.js';
import { User, Role } from '../types/index.js';
import { formatDateTime } from '../utils/formatters.js';
import { Search } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const roleParam = selectedRole !== 'ALL' ? (selectedRole as Role) : undefined;
      const data = await adminService.listUsers(roleParam, 1, 50, search || undefined);
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, search]);

  const handleToggleStatus = async (user: User) => {
    try {
      await adminService.toggleUserStatus(user.id, !user.isActive);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management & Access</h1>
          <p className="text-xs text-slate-500">
            View all customers, restaurant managers, delivery drivers, and system admins
          </p>
        </div>

        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
          {users.length} Users
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CUSTOMER', 'RESTAURANT', 'DELIVERY_PARTNER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedRole === r
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No users match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            u.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              u.name
                            )}&background=f97316&color=fff`
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{u.phone || '—'}</td>
                    <td className="p-4">
                      {u.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold text-[10px] border border-rose-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{u.createdAt ? formatDateTime(u.createdAt) : '—'}</td>
                    <td className="p-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            u.isActive
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
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
