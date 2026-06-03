import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/axiosInstance';
import { RefreshCw } from 'lucide-react';

// Helper formatDate
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fetchMyDonations = async ({ page = 1, limit = 20 }) => {
  const params = new URLSearchParams({ page, limit });
  return (await api.get(`/api/donations/my-donations?${params}`)).data;
};

const MyDonationsHistory = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['myDonations', page],
    queryFn: () => fetchMyDonations({ page, limit: 20 }),
    keepPreviousData: true,
    refetchInterval: 30000,
  });

  const donations = data?.donations || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white dark:bg-slate-900 rounded-none shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        <div className="px-6 md:px-10 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              RIWAYAT BERDONASI SAYA
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Total {pagination.total || 0} donasi
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-slate-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-medium">
            Memuat riwayat donasi...
          </div>
        ) : donations.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-6xl mb-4">💸</p>
            <p className="font-black text-xl">Belum ada donasi yang kamu kirim</p>
            <p className="text-sm mt-2">Donasi pertama kamu akan muncul di sini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5">Streamer</th>
                  <th className="px-6 py-5">Jumlah</th>
                  <th className="px-6 py-5">Pesan</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {donations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-5">
                      <p className="font-black text-slate-700 dark:text-slate-200">@{donation.streamerUsername || 'Unknown'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-emerald-600 dark:text-emerald-400 font-black">
                        Rp {Number(donation.amount).toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-5 max-w-[300px]">
                      <p className="text-slate-600 dark:text-slate-400 text-sm italic truncate">
                        {donation.message ? `"${donation.message}"` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-xs font-black rounded-full ${
                        donation.status === 'PAID' 
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                          : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                      {formatDate(donation.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-none font-bold disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              ← Sebelumnya
            </button>
            
            <span className="text-sm font-medium text-slate-500">
              Halaman {page} dari {pagination.totalPages}
            </span>

            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} 
              disabled={page === pagination.totalPages}
              className="px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-none font-bold disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDonationsHistory;