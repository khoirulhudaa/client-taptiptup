// components/IpBlacklistPage.jsx
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Ban,
  ChevronDown,
  Clock,
  Loader2,
  Plus,
  PlusCircle,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ── InputField lokal (sama dengan yg sudah ada di project) ───────────────────
const InputField = ({ label, ...props }) => (
  <div className="w-full flex p-[2.5px] pl-[5px] items-center bg-transparent dark:bg-slate-900 border border-slate-100 dark:border-slate-500/50 rounded-xl overflow-hidden focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-all shadow-sm">
    <div className="relative w-max px-3 py-3 rounded-lg text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-200/50 dark:bg-slate-800">
      {label}
    </div>
    <input
      className="flex-1 bg-transparent p-3 h-11.5 pl-3 outline-none font-bold text-sm text-slate-900 dark:text-slate-100"
      {...props}
    />
  </div>
);

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
};

// ── Tab: Daftar IP Terblokir ─────────────────────────────────────────────────
const BlockedIpList = ({ blacklist, onDelete, loading }) => {
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = blacklist.filter(
    (e) =>
      e.ip.includes(search) ||
      e.donorName?.toLowerCase().includes(search.toLowerCase()) ||
      e.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    setDeleting(true);
    await onDelete(id);
    setDeleting(false);
    setConfirmId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-blue-400" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari IP, nama donor, atau alasan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-blue-400 transition-all"
        />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Shield size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="font-black text-slate-500 dark:text-slate-400">
            {search ? 'Tidak ada hasil' : 'Belum ada IP yang diblokir'}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">
            {search ? 'Coba kata kunci lain' : 'Tambah IP dari tab "Riwayat Donasi"'}
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((entry) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl"
            >
              {/* Icon */}
              <div className="w-9 h-9 bg-red-100 dark:bg-red-900/30 border border-red-500/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ban size={15} className="text-red-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-sm text-slate-800 dark:text-white">
                    {entry.ip}
                  </span>
                  {entry.donorName && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                      {entry.donorName}
                    </span>
                  )}
                </div>
                {entry.reason && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate">
                    {entry.reason}
                  </p>
                )}
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                  <Clock size={9} /> {timeAgo(entry.createdAt)}
                </p>
              </div>

              {/* Delete */}
              {confirmId === entry._id ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(entry._id)}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60"
                  >
                    {deleting ? <Loader2 size={11} className="animate-spin" /> : 'Ya, Hapus'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black rounded-lg transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(entry._id)}
                  className="w-8 h-8 flex items-center justify-center text-slate-300 dark:text-white hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Tab: Tambah Manual + Riwayat Donasi dengan IP ───────────────────────────
const AddFromDonations = ({ onAdd, blacklist }) => {
  const [manualIp, setManualIp]     = useState('');
  const [manualReason, setManualReason] = useState('');
  const [adding, setAdding]         = useState(null); // donationId | 'manual'
  const [donations, setDonations]   = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const blockedIpSet = new Set(blacklist.map((e) => e.ip));

  useEffect(() => {
    setLoadingDonations(true);
    axios
      .get(`${BASE_URL}/api/ip-blacklist/donations-with-ip`, { headers: authHeader() })
      .then((res) => setDonations(res.data.donations || []))
      .catch(() => {})
      .finally(() => setLoadingDonations(false));
  }, [blacklist.length]);

  const handleManualAdd = async () => {
    if (!manualIp.trim()) return setError('IP address wajib diisi');
    setError('');
    setSuccess('');
    setAdding('manual');
    try {
      await onAdd({ ip: manualIp.trim(), reason: manualReason.trim() });
      setSuccess(`IP ${manualIp.trim()} berhasil diblokir`);
      setManualIp('');
      setManualReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan IP');
    } finally {
      setAdding(null);
    }
  };

  const handleBlockFromDonation = async (donation) => {
    setAdding(donation._id);
    setError('');
    setSuccess('');
    try {
      await onAdd({
        ip: donation.donorIp,
        donationId: donation._id,
        donorName: donation.donorName,
        reason: `Auto: dari donasi Rp ${Number(donation.amount).toLocaleString('id-ID')}`,
      });
      setSuccess(`IP ${donation.donorIp} (${donation.donorName}) berhasil diblokir`);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memblokir IP');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Manual Add ── */}
      <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
          Tambah IP Manual
        </p>
        <InputField
          label="IP"
          type="text"
          value={manualIp}
          onChange={(e) => setManualIp(e.target.value)}
          placeholder="contoh: 192.168.1.100"
          onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
        />
        <InputField
          label="Alasan"
          type="text"
          value={manualReason}
          onChange={(e) => setManualReason(e.target.value)}
          placeholder="Opsional — alasan pemblokiran"
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400"
            >
              <AlertCircle size={12} /> {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-[11px] font-bold text-green-700 dark:text-green-400"
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleManualAdd}
          disabled={adding === 'manual' || !manualIp.trim()}
          className="
           text-slate-900 dark:text-white 
            -translate-y-[3px] translate-x-[-3px]
            [box-shadow:4px_6px_0_#f1f5f9]
            dark:[box-shadow:4px_4px_0_#99a3b1]
            hover:translate-y-0 hover:translate-x-0
            border border-slate-300
            hover:[box-shadow:0_0_0_#f1f5f9]
            dark:hover:[box-shadow:0_0_0_#94a3b8]
            active:translate-y-[2px] active:translate-x-[2px]
            active:[box-shadow:none]
          active:bg-slate-300 dark:active:bg-slate-800
          w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding === 'manual' ? (
            <><Loader2 size={15} className="animate-spin" /> Memblokir...</>
          ) : (
            <><Ban size={14} /> Blokir IP</>
          )}
        </button>
      </div>

      {/* ── Block from Donation History ── */}
      <div className="space-y-3">
        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Blokir dari Riwayat Donasi
        </p>

        {loadingDonations ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-blue-400" size={20} />
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
            Belum ada riwayat donasi dengan data IP
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {donations.map((d) => {
              const alreadyBlocked = d.isBlocked || blockedIpSet.has(d.donorIp);
              return (
                <div
                  key={d._id}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    alreadyBlocked
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                    {(d.donorName || 'A').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-800 dark:text-white truncate">
                        {d.donorName || 'Anonim'}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                        Rp {Number(d.amount).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {d.donorIp}
                    </p>
                  </div>

                  {/* Block Button */}
                  {alreadyBlocked ? (
                    <span className="text-[10px] font-black text-red-500 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg flex-shrink-0">
                      Diblokir
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBlockFromDonation(d)}
                      disabled={adding === d._id}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-black rounded-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      {adding === d._id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <><Ban size={11} /> Blokir</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const IpBlacklistPage = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchBlacklist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/ip-blacklist`, { headers: authHeader() });
      setBlacklist(res.data.blacklist || []);
    } catch {
      setFetchError('Gagal memuat blacklist');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleAdd = async (payload) => {
    const res = await axios.post(`${BASE_URL}/api/ip-blacklist`, payload, {
      headers: authHeader(),
    });
    setBlacklist((prev) => [res.data.entry, ...prev]);
    return res.data;
  };

  const handleDelete = async (id) => {
    await axios.delete(`${BASE_URL}/api/ip-blacklist/${id}`, { headers: authHeader() });
    setBlacklist((prev) => prev.filter((e) => e._id !== id));
  };

  const tabs = [
    { id: 'list', label: `Blokir (${blacklist.length})`, icon: Shield },
    { id: 'add',  label: 'Tambah',              icon: PlusCircle   },
  ];

  return (
    <div className="space-y-5 pb-0 w-full">
      {/* ── Header Card ── */}
      <div className="bg-white/30 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Shield size={20} className='relative top-[-1.5px]' />
          </div>
          <div>
            <h2 className="font-black text-slate-800 dark:text-white text-base md:text-lg">
              IP Blacklist
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Blokir IP tertentu agar tidak bisa donasi ke akunmu
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="grid grid-cols-2 md:px-0 px-4 gap-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
               text-slate-900 dark:text-white
                -translate-y-[3px] translate-x-[-3px]
                [box-shadow:4px_6px_0_#f1f5f9]
                dark:[box-shadow:4px_4px_0_#99a3b1]
                hover:translate-y-0 hover:translate-x-0
                hover:bg-slate-200 dark:hover:bg-slate-700
                border border-slate-300
                hover:[box-shadow:0_0_0_#f1f5f9]
                dark:hover:[box-shadow:0_0_0_#94a3b8]
                active:translate-y-[2px] active:translate-x-[2px]
                active:[box-shadow:none]
              active:bg-slate-300 dark:active:bg-slate-800
              flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-sm transition-all cursor-pointer border ${
              activeTab === id
                ? 'bg-slate-900 dark:bg-slate-700 text-white border-transparent'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-500/70'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="md:bg-white/30 dark:md:bg-slate-900/60 backdrop-blur-sm md:rounded-xl px-4 md:p-6 md:shadow-xs md:border border-slate-100 dark:border-slate-800">
        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {fetchError ? (
                <div className="text-center py-8 text-slate-500 font-medium text-sm">{fetchError}</div>
              ) : (
                <BlockedIpList
                  blacklist={blacklist}
                  onDelete={handleDelete}
                  loading={loading}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <AddFromDonations onAdd={handleAdd} blacklist={blacklist} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IpBlacklistPage;