// ─── AdminWithdrawalPage ──────────────────────────────────────────────────────
// Paste ini sebagai pengganti komponen AdminWithdrawalPage di DashboardStreamer.jsx

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export const AdminWithdrawalPage = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectTargetId, setRejectTargetId] = useState(null);

  const fetchAdminWDs = async () =>
    (await axios.get(`${BASE_URL}/api/midtrans/admin/withdrawals?status=${statusFilter}`, { headers: authHeader() })).data;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['adminWithdrawals', statusFilter],
    queryFn: fetchAdminWDs,
    refetchInterval: 30000,
  });

  const withdrawals = data?.withdrawals || [];
  console.log('withdraw', withdrawals)
  const pagination  = data?.pagination  || {};

  const updateMutation = useMutation({
    mutationFn: ({ id, status, note }) =>
      axios.put(`${BASE_URL}/api/midtrans/admin/withdrawals/${id}`, { status, note }, { headers: authHeader() }).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] });
      setRejectNote('');
      setRejectTargetId(null);
    },
    onError: (err) => alert(err.response?.data?.message || 'Gagal update status'),
  });

  const handleApprove = (id) => {
    if (!window.confirm('Konfirmasi: Kamu sudah transfer manual ke streamer?')) return;
    updateMutation.mutate({ id, status: 'COMPLETED' });
  };

  const handleReject = (id) => {
    updateMutation.mutate({ id, status: 'FAILED', note: rejectNote || 'Ditolak oleh admin' });
  };

  const STATUS_FILTERS = [
    { val: 'PENDING',   label: '⏳ Pending'   },
    { val: 'COMPLETED', label: '✅ Selesai'   },
    { val: 'FAILED',    label: '❌ Ditolak'   },
    { val: '',          label: '📋 Semua'     },
  ];

  return (
    <div className="w-full mx-auto space-y-5 pb-6">

      {/* Header */}
      <div className="w-full mx-auto space-y-5 pb-6 bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 from-blue-700 to-indigo-800  rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-200 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Super Admin</p>
            <h2 className="text-2xl font-black">Penarikan Dana</h2>
            <p className="text-blue-300 dark:text-slate-400 text-sm font-medium mt-1">
              Approve = kamu sudah transfer manual. Reject = saldo dikembalikan ke streamer.
            </p>
          </div>
          {/* <div className="flex items-center gap-2 text-blue-200 dark:text-slate-400 text-xs font-bold">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Auto 30s
            <button onClick={() => refetch()} disabled={isFetching} className="ml-1 hover:text-white transition-colors disabled:opacity-50">
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div> */}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f.val} onClick={() => setStatusFilter(f.val)}
            className={`px-3 py-2 rounded-xl font-black text-sm transition-all ${
              statusFilter === f.val
                ? 'bg-blue-600 text-white shadow-none'
                : 'bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-600'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white w-full rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {statusFilter ? `Request ${statusFilter}` : 'Semua Request'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{pagination.total || 0} total</p>
          </div>
          <span className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Super Admin Only</span>
        </div>

        {isLoading
          ? (
            <div className="flex items-center justify-center py-20 text-slate-400 font-bold gap-3">
              <div className="w-5 h-5 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              Memuat data...
            </div>
          )
          : withdrawals.length === 0
            ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-black text-slate-500">Tidak ada request {statusFilter.toLowerCase()}</p>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      {['Streamer', 'Jumlah', 'Metode / Bank', 'No. Rekening', 'Nama', 'Status', 'Waktu', ...(statusFilter === 'PENDING' ? ['Aksi'] : [])].map(h => (
                        <th key={h} className="px-6 py-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {withdrawals.map(wd => (
                      <tr key={wd._id} className="hover:bg-slate-50 transition-all">
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-700 text-sm">@{wd.userId?.username || '-'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{wd.userId?.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-blue-600 font-black text-sm">Rp {Number(wd.amount).toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-slate-400 font-medium">+Rp 5.000 fee</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-600 text-sm">{wd.paymentMethod || 'BANK'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{wd.channelCode}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-mono font-bold text-slate-700 text-sm">{wd.accountNumber}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-600 text-sm">{wd.accountName}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${
                            wd.status === 'COMPLETED' ? 'bg-green-100 text-green-600'
                            : wd.status === 'FAILED' ? 'bg-red-100 text-red-500'
                            : 'bg-amber-100 text-amber-600'
                          }`}>
                            {wd.status === 'COMPLETED' ? '✅' : wd.status === 'FAILED' ? '❌' : '⏳'} {wd.status}
                          </span>
                          {wd.status === 'FAILED' && wd.note && (
                            <p className="text-[10px] text-red-400 font-medium mt-1 max-w-[120px]">{wd.note}</p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{formatDate(wd.createdAt)}</p>
                        </td>
                        {statusFilter === 'PENDING' && (
                          <td className="px-6 py-5">
                            {wd.status === 'PENDING' && (
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              {/* Tombol Approve */}
                              <button
                                onClick={() => handleApprove(wd._id)}
                                disabled={updateMutation.isPending}
                                className="cursor-pointer active:scale-[0.97] px-4 py-2 bg-green-600 text-white rounded-xl text-[11px] font-black hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                                ✅ Approve & Sudah Transfer
                              </button>

                              {/* Reject dengan alasan */}
                              {rejectTargetId === wd._id
                                ? (
                                  <div className="space-y-2">
                                    <input
                                      value={rejectNote}
                                      onChange={e => setRejectNote(e.target.value)}
                                      placeholder="Alasan penolakan (opsional)"
                                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-red-400 transition-all"
                                    />
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => handleReject(wd._id)}
                                        disabled={updateMutation.isPending}
                                        className="cursor-pointer flex-1 px-3 py-2 bg-red-600 text-white rounded-xl text-[11px] font-black hover:bg-red-700 transition-all disabled:opacity-50">
                                        Konfirmasi Tolak
                                      </button>
                                      <button
                                        onClick={() => { setRejectTargetId(null); setRejectNote(''); }}
                                        className="cursor-pointer px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black hover:bg-slate-200 transition-all">
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                )
                                : (
                                  <button
                                    onClick={() => setRejectTargetId(wd._id)}
                                    disabled={updateMutation.isPending}
                                    className="cursor-pointer active:scale-[0.97] px-4 py-2 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[11px] font-black hover:bg-red-100 transition-all disabled:opacity-50">
                                    ❌ Tolak
                                  </button>
                                )
                              }
                            </div>
                          )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        }
      </div>
    </div>
  );
};