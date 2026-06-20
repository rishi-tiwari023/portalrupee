import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Clock, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useSelector } from 'react-redux';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state) => state.auth);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/pending-approvals');
      setPendingUsers(data.data.pendingUsers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const response = await api.patch(`/admin/users/${id}/approve-registration`, { action });
      toast.success(response.data.message);
      fetchPendingApprovals();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} user`);
    }
  };

  const filteredUsers = pendingUsers.filter(u => 
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Pending Approvals
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Review and approve new {user?.role === 'ADMIN' ? 'Manager and Cashier' : 'Customer'} registrations
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No Pending Approvals</h3>
            <p className="text-slate-500 text-sm mt-1">All caught up! There are no new registrations awaiting review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((pendingUser) => (
                  <tr key={pendingUser._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                          {pendingUser.firstName[0]}{pendingUser.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{pendingUser.firstName} {pendingUser.lastName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Status: PENDING
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        pendingUser.role === 'MANAGER' ? 'bg-purple-100 text-purple-700' :
                        pendingUser.role === 'CASHIER' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {pendingUser.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 font-medium">{pendingUser.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{pendingUser.mobile}</div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {new Date(pendingUser.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleAction(pendingUser._id, 'APPROVE')}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(pendingUser._id, 'REJECT')}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PendingApprovals;
