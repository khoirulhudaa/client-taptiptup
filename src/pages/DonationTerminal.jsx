// pages/DonationTerminal.jsx
// Khusus superAdmin — terminal log aktivitas donasi real-time

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axiosInstance';

const fetchLogs = async ({ streamer = 'all', limit = 50, page = 1, status = '', startDate = '', endDate = '' }) => {
  const params = new URLSearchParams({
    streamer, limit, page, status,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });
  return (await api.get(`/api/midtrans/admin/donation-logs?${params}`)).data;
};

const fetchStreamers = async () =>
  (await api.get('/api/midtrans/admin/streamers-list')).data;

const formatRp = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

const formatTs = (d) =>
  new Date(d).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).replace(',', '');

const STATUS_COLOR = {
  PAID:    { bg: '#052e1688', border: '#22c55e40', dot: '#22c55e', text: '#86efac' },
  PENDING: { bg: '#42200488', border: '#facc1540', dot: '#facc15', text: '#fde68a' },
  EXPIRED: { bg: '#450a0a88', border: '#ef444440', dot: '#ef4444', text: '#fca5a5' },
};

const TYPE_ICON = (d) => {
  if (d.voiceUrl) return '🎙️';
  if (d.mediaUrl) return '🎬';
  return '💜';
};

const mono = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => (
  <div className="relative overflow-hidden bg-white/[0.03] md:px-4.5 px-3.5 py-2.5">
    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-white mb-1">
      {label}
    </div>
    <div 
      className="font-mono font-black text-[16px] leading-none"
      style={{ color }}
    >
      {value}
    </div>
  </div>
);

// ── Log Row Desktop ───────────────────────────────────────────────────────────
const LogRowDesktop = ({ d, idx, highlight }) => {
  const s = STATUS_COLOR[d.status] || STATUS_COLOR.PENDING;
  return (
    <motion.div
      initial={highlight ? { opacity: 0, x: -10, backgroundColor: '#22c55e15' } : { opacity: 0, y: 3 }}
      animate={{ opacity: 1, x: 0, y: 0, backgroundColor: 'transparent' }}
      transition={{ duration: highlight ? 0.45 : 0.1, delay: highlight ? 0 : idx * 0.005 }}
      className="log-row"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr) 2fr',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        fontFamily: mono, fontSize: 12, cursor: 'default',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ padding: '9px 20px', color: 'white' }}>{formatTs(d.createdAt)}</div>
      <div style={{ padding: '9px 20px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{d.userId?.username || '—'}</div>
      <div style={{ padding: '9px 20px', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.donorName}</div>
      <div style={{ padding: '9px 20px', color: '#34d399', fontWeight: 700 }}>{formatRp(d.amount)}</div>
      <div style={{ padding: '9px 10px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: s.bg, border: `1px solid ${s.border}`,
          padding: '2px 7px', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.1em', color: s.text,
        }}>
          <span style={{ width: 5, height: 5, background: s.dot, display: 'inline-block', flexShrink: 0 }} />
          {d.status}
        </span>
      </div>
      <div style={{ padding: '9px 20px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.message || '—'}</div>
    </motion.div>
  );
};

// ── Log Row Mobile (card) ─────────────────────────────────────────────────────
const LogRowMobile = ({ d, idx, highlight }) => {
  const s = STATUS_COLOR[d.status] || STATUS_COLOR.PENDING;
  return (
    <motion.div
      initial={highlight ? { opacity: 0, x: -10, backgroundColor: '#22c55e15' } : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0, backgroundColor: 'transparent' }}
      transition={{ duration: highlight ? 0.45 : 0.1, delay: highlight ? 0 : idx * 0.005 }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 14px',
        fontFamily: mono,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}
    >
      {/* Row 1: donor + amount */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{d.donorName}</span>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#34d399' }}>{formatRp(d.amount)}</span>
      </div>
      {/* Row 2: streamer + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#818cf8' }}>@{d.userId?.username || '—'}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: s.bg, border: `1px solid ${s.border}`,
          padding: '2px 7px', fontSize: 9, fontWeight: 700,
          letterSpacing: '0.1em', color: s.text,
        }}>
          <span style={{ width: 4, height: 4, background: s.dot, display: 'inline-block' }} />
          {d.status}
        </span>
      </div>
      {/* Row 3: message */}
      {d.message && (
        <div style={{
          fontSize: 11, color: 'white',
          background: 'rgba(255,255,255,0.03)',
          padding: '5px 8px',
          borderLeft: '2px solid rgba(255,255,255,0.08)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{d.message}</div>
      )}
      {/* Row 4: timestamp + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'white' }}>{formatTs(d.createdAt)}</span>
        <span style={{ fontSize: 13 }}>{TYPE_ICON(d)}</span>
      </div>
    </motion.div>
  );
};

// ── Filter Input ─────────────────────────────────────────────────────────────
const FilterInput = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <span style={{ fontSize: 10, color: 'white', letterSpacing: '0.13em', textTransform: 'uppercase', fontFamily: mono, flexShrink: 0 }}>
      {label}
    </span>
    {children}
  </div>
);

const inputStyle = {
  background: '#0d1117', border: '1px solid #1f2937',
  color: '#e2e8f0', fontFamily: mono, fontSize: 11.5,
  padding: '5px 10px', outline: 'none', transition: 'border-color 0.15s',
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPage, isFetching }) => {
  const pages = [];
  const WINDOW = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - WINDOW && i <= page + WINDOW)) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  const btn = {
    padding: '5px 10px', fontFamily: mono, fontSize: 11,
    fontWeight: 700, border: '1px solid #1f2937',
    cursor: 'pointer', transition: 'all 0.12s', letterSpacing: '0.06em',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      <button onClick={() => onPage(page - 1)} disabled={page <= 1 || isFetching}
        style={{ ...btn, background: 'transparent', color: page <= 1 ? '#1f2937' : 'white', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}>
        ← PREV
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ color: 'white', fontFamily: mono, fontSize: 11, padding: '0 4px' }}>···</span>
        ) : (
          <button key={p} onClick={() => onPage(p)} disabled={isFetching}
            style={{ ...btn, background: p === page ? '#1e1b4b' : 'transparent', color: p === page ? '#818cf8' : 'white', borderColor: p === page ? '#3730a3' : '#1f2937' }}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages || isFetching}
        style={{ ...btn, background: 'transparent', color: page >= totalPages ? '#1f2937' : 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}>
        NEXT →
      </button>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const DonationTerminal = () => {
  const [selectedStreamer, setSelectedStreamer] = useState('all');
  const [statusFilter, setStatusFilter]         = useState('');
  const [limit, setLimit]                       = useState(50);
  const [page, setPage]                         = useState(1);
  const [autoRefresh, setAutoRefresh]           = useState(true);
  const [searchDonor, setSearchDonor]           = useState('');
  const [newIds, setNewIds]                     = useState(new Set());
  const [startDate, setStartDate]               = useState('');
  const [endDate, setEndDate]                   = useState('');
  const [isMobile, setIsMobile]                 = useState(false);
  const prevIdsRef = useRef(new Set());

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setPage(1); }, [selectedStreamer, statusFilter, limit, startDate, endDate, searchDonor]);

  const { data: streamersData } = useQuery({
    queryKey: ['adminStreamersList'],
    queryFn: fetchStreamers,
    staleTime: 60000,
  });

  const { data, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['adminDonationLogs', selectedStreamer, limit, page, statusFilter, startDate, endDate],
    queryFn: () => fetchLogs({ streamer: selectedStreamer, limit, page, status: statusFilter, startDate, endDate }),
    refetchInterval: autoRefresh ? 8000 : false,
    staleTime: 4000,
    keepPreviousData: true,
  });

  const allDonations = data?.donations || [];
  const donations = allDonations.filter(d =>
    !searchDonor || d.donorName?.toLowerCase().includes(searchDonor.toLowerCase())
  );
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.total      || 0;

  useEffect(() => {
    if (!allDonations.length) return;
    const currIds = new Set(allDonations.map(d => d._id));
    const fresh = new Set([...currIds].filter(id => !prevIdsRef.current.has(id)));
    if (prevIdsRef.current.size > 0 && fresh.size > 0) {
      setNewIds(fresh);
      setTimeout(() => setNewIds(new Set()), 3000);
    }
    prevIdsRef.current = currIds;
  }, [allDonations]);

  const streamers  = streamersData?.users || [];
  const paid       = donations.filter(d => d.status === 'PAID');
  const pending    = donations.filter(d => d.status === 'PENDING');
  const expired    = donations.filter(d => d.status === 'EXPIRED');
  const totalPaid  = paid.reduce((s, d) => s + (d.amount || 0), 0);
  const withMedia  = paid.filter(d => d.mediaUrl).length;
  const withVoice  = paid.filter(d => d.voiceUrl).length;

  const handlePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p); };

  const colHeaders = ['TIMESTAMP', 'STREAMER', 'DONOR', 'NOMINAL', 'STATUS', 'PESAN'];

  return (
    <div style={{ height: 'max-content', color: '#e2e8f0', fontFamily: mono }} className='bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800'>

      {/* Scanline */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div 
        style={{
          padding: isMobile ? '12px 14px' : '14px 19px',
          borderBottom: '1px solid rgba(99,102,241,0.18)',
          // background: 'rgba(99,102,241,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {['#ef4444', '#facc15', '#22c55e'].map((c, i) => (
                <div key={i} style={{ width: 10, height: 10, background: c }} />
              ))}
            </div>
            <span style={{ fontSize: isMobile ? 12 : 14, fontWeight: 900, letterSpacing: '0.18em', color: 'white' }}>
              DONATION_TERMINAL
            </span>
            {!isMobile && (
              <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'white', background: '#111827', padding: '2px 8px', border: '1px solid #1f2937' }}>
                v1.0 · SUPERADMIN
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
            {isFetching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, background: '#22c55e', animation: 'blink 0.8s step-end infinite' }} />
                <span style={{ color: '#22c55e', letterSpacing: '0.1em', fontSize: 10 }}>LIVE</span>
              </div>
            )}
            <span style={{ color: 'white', fontSize: 10 }}>
              {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('id-ID') : '—'}
            </span>
          </div>
        </div>

        {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-px p-3 md:p-0 border-b border-white/[0.04] bg-white/[0.02]">
          <StatCard label="Total"      value={donations.length}                          color="#818cf8" />
          <StatCard label="Paid"       value={paid.length}                               color="#22c55e" />
          <StatCard label="Pending"    value={pending.length}                            color="#facc15" />
          <StatCard label="Expired"    value={expired.length}                            color="#ef4444" />
          <StatCard label="Total Paid" value={`Rp ${totalPaid.toLocaleString('id-ID')}`} color="#34d399" />
          <StatCard label="W/Media"    value={withMedia}                                 color="#a78bfa" />
          <StatCard label="W/Voice"    value={withVoice}                                 color="#f472b6" />
        </div>

        {/* ══ CONTROLS ════════════════════════════════════════════════════════ */}
        <div style={{
          padding: isMobile ? '12px 12px' : '12px 19px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          // background: 'rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          {isMobile ? (
            // ── Mobile controls ──
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select value={selectedStreamer} onChange={e => setSelectedStreamer(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: 0, cursor: 'pointer', fontSize: 11 }}>
                  <option value="all">[ ALL ]</option>
                  {streamers.map(u => <option key={u._id} value={u.username}>@{u.username}</option>)}
                </select>
                <div style={{ display: 'flex' }}>
                  {[{ val: '', label: 'ALL' }, { val: 'PAID', label: 'PAID' }, { val: 'PENDING', label: 'PND' }, { val: 'EXPIRED', label: 'EXP' }].map(f => (
                    <button key={f.val} onClick={() => setStatusFilter(f.val)} style={{
                      padding: '5px 9px', fontFamily: mono, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.08em', border: '1px solid #1f2937', borderRight: 'none',
                      cursor: 'pointer', outline: 'none',
                      background: statusFilter === f.val ? '#3730a3' : 'transparent',
                      color: statusFilter === f.val ? '#c7d2fe' : 'white',
                    }}>{f.label}</button>
                  ))}
                  <div style={{ width: 1, background: '#1f2937' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={searchDonor} onChange={e => setSearchDonor(e.target.value)}
                  placeholder="donor name..." style={{ ...inputStyle, flex: 1, fontSize: 11 }} />
                <button onClick={() => setAutoRefresh(v => !v)} style={{
                  ...inputStyle, cursor: 'pointer', fontSize: 9, fontWeight: 900,
                  background: autoRefresh ? '#052e16' : 'transparent',
                  color: autoRefresh ? '#86efac' : 'white',
                  border: `1px solid ${autoRefresh ? '#14532d' : '#1f2937'}`,
                  whiteSpace: 'nowrap',
                }}>{autoRefresh ? '⏸ AUTO' : '▶ AUTO'}</button>
                <button onClick={() => refetch()} style={{
                  ...inputStyle, cursor: 'pointer', fontSize: 9, fontWeight: 900,
                  background: 'transparent', color: 'white',
                }}>↺</button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontSize: 11 }} />
                <span style={{ color: 'white', fontSize: 10 }}>–</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  style={{ ...inputStyle, flex: 1, fontSize: 11 }} />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{
                    ...inputStyle, cursor: 'pointer', background: '#1a0a0a',
                    color: '#f87171', border: '1px solid #7f1d1d', fontSize: 9, fontWeight: 700,
                  }}>✕</button>
                )}
              </div>
              <div className='ml-[1.5px] md:ml-[2px]' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FilterInput label="Rows">
                  <div style={{ display: 'flex' }}>
                    {[25, 50, 100].map(n => (
                      <button key={n} onClick={() => setLimit(n)} style={{
                        padding: '4px 8px', fontFamily: mono, fontSize: 9, fontWeight: 700,
                        border: '1px solid #1f2937', borderRight: 'none', cursor: 'pointer', outline: 'none',
                        background: limit === n ? '#1e1b4b' : 'transparent',
                        color: limit === n ? '#818cf8' : 'white',
                      }}>{n}</button>
                    ))}
                    <div style={{ width: 1, background: '#1f2937' }} />
                  </div>
                </FilterInput>
                <span style={{ fontSize: 10, color: 'white' }}>
                  {donations.length} of {totalCount}
                </span>
              </div>
            </>
          ) : (
            // ── Desktop controls ──
            <>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center'}}>
                <FilterInput label="Streamer">
                  <select value={selectedStreamer} onChange={e => setSelectedStreamer(e.target.value)}
                    style={{ ...inputStyle, width: 210, cursor: 'pointer' }}>
                    <option value="all">[ ALL STREAMERS ]</option>
                    {streamers.map(u => (
                      <option key={u._id} value={u.username}>
                        @{u.username} · Rp{Number(u.totalDonations || 0).toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                </FilterInput>
                <FilterInput label="Status">
                  <div style={{ display: 'flex' }}>
                    {[{ val: '', label: 'ALL' }, { val: 'PAID', label: 'PAID' }, { val: 'PENDING', label: 'PND' }, { val: 'EXPIRED', label: 'EXP' }].map(f => (
                      <button key={f.val} onClick={() => setStatusFilter(f.val)} style={{
                        padding: '5px 12px', fontFamily: mono, fontSize: 10,
                        fontWeight: 700, letterSpacing: '0.1em', border: '1px solid #1f2937',
                        borderRight: 'none', cursor: 'pointer', transition: 'all 0.12s', outline: 'none',
                        background: statusFilter === f.val ? '#3730a3' : 'transparent',
                        color: statusFilter === f.val ? '#c7d2fe' : 'white',
                      }}>{f.label}</button>
                    ))}
                    <div style={{ width: 1, background: '#1f2937' }} />
                  </div>
                </FilterInput>
                <FilterInput label="Search">
                  <input value={searchDonor} onChange={e => setSearchDonor(e.target.value)}
                    placeholder="donor name..." style={{ ...inputStyle, width: 150 }} />
                </FilterInput>
                <FilterInput label="From">
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
                </FilterInput>
                <FilterInput label="To">
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
                </FilterInput>
              </div>
              <div className='mt-1' style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <FilterInput label="Rows/Page">
                  <div style={{ display: 'flex' }}>
                    {[25, 50, 100, 200].map(n => (
                      <button key={n} onClick={() => setLimit(n)} style={{
                        padding: '5px 10px', fontFamily: mono, fontSize: 10,
                        fontWeight: 700, border: '1px solid #1f2937', borderRight: 'none',
                        cursor: 'pointer', outline: 'none',
                        background: limit === n ? '#1e1b4b' : 'transparent',
                        color: limit === n ? '#818cf8' : 'white',
                      }}>{n}</button>
                    ))}
                    <div style={{ width: 1, background: '#1f2937' }} />
                  </div>
                </FilterInput>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setAutoRefresh(v => !v)} style={{
                    ...inputStyle, cursor: 'pointer', fontSize: 10, fontWeight: 900,
                    background: autoRefresh ? '#052e16' : 'transparent',
                    color: autoRefresh ? '#86efac' : 'white',
                    border: `1px solid ${autoRefresh ? '#14532d' : '#1f2937'}`,
                  }}>{autoRefresh ? '⏸ AUTO:ON' : '▶ AUTO:OFF'}</button>
                  <button onClick={() => refetch()} style={{
                    ...inputStyle, cursor: 'pointer', background: 'transparent',
                    color: 'white', fontSize: 10, fontWeight: 900,
                  }}>↺ REFRESH</button>
                  {(startDate || endDate) && (
                    <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{
                      ...inputStyle, cursor: 'pointer', background: '#1a0a0a',
                      color: '#f87171', border: '1px solid #7f1d1d', fontSize: 10, fontWeight: 700,
                    }}>✕ CLEAR DATE</button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ══ COL HEADERS (desktop only) ══════════════════════════════════════ */}
        {!isMobile && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr) 2fr',
            background: 'rgba(99,102,241,0.07)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
          }}>
            {colHeaders.map(h => (
              <div
                className='py-[7px] px-[14px] md:px-[19px]'
                key={h} style={{
                // padding: '7px 14px',
                fontFamily: mono, fontSize: 11, fontWeight: 900,
                color: '#6366f1', letterSpacing: '0.13em', textTransform: 'uppercase',
              }}>{h}</div>
            ))}
          </div>
        )}

        {/* ══ ROWS ════════════════════════════════════════════════════════════ */}
        <div style={{ minHeight: 200, opacity: isFetching ? 0.65 : 1, transition: 'opacity 0.2s' }}>
          {isLoading ? (
            <div style={{
              padding: 50, textAlign: 'center', color: '#22c55e',
              fontSize: 11, letterSpacing: '0.15em', fontFamily: mono,
              animation: 'blink 1s step-end infinite',
            }}>{'> '} FETCHING LOGS...</div>
          ) : donations.length === 0 ? (
            <div style={{
              padding: 50, textAlign: 'center',
              color: '#1f2937', fontSize: 11, letterSpacing: '0.12em', fontFamily: mono,
            }}>{'> '} NO RECORDS FOUND</div>
          ) : (
            <AnimatePresence initial={false}>
              {donations.map((d, i) =>
                isMobile
                  ? <LogRowMobile key={d._id} d={d} idx={i} highlight={newIds.has(d._id)} />
                  : <LogRowDesktop key={d._id} d={d} idx={i} highlight={newIds.has(d._id)} />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* ══ FOOTER / PAGINATION ═════════════════════════════════════════════ */}
        <div style={{
          padding: isMobile ? '12px 16px' : '12px 15px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center',
          justifyContent: totalPages > 1 ? 'space-between' : 'flex-start',
          flexWrap: 'wrap', gap: 10,
          background: 'rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontSize: 9, color: 'white', letterSpacing: '0.08em', fontFamily: mono }}>
            PAGE {page}/{totalPages} · {donations.length}/{totalCount}
            {autoRefresh ? ' · AUTO:8s' : ''}
          </span>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPage={handlePage} isFetching={isFetching} />
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        * { box-sizing: border-box; }
        select option { background: #0d1117; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); cursor: pointer; }
        button:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #1f2937; }
        .log-row:hover { background: rgba(255,255,255,0.025) !important; }
      `}</style>
    </div>
  );
};

export default DonationTerminal;