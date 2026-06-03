import { motion } from 'framer-motion';
import {
  AtSign,
  Clock,
  Code2,
  ExternalLink,
  GitBranch,
  Globe,
  Headphones,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Sparkles,
} from 'lucide-react';
import { SuggestionsManager } from './SuggestionsManager';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const DEVELOPER = {
  name: 'Muhammad Khoirul huda',
  role: 'Fullstack Developer & Founder',
  avatar: 'MH',
  bio: 'Membangun TapTipTup dari nol dengan passion untuk mendukung ekosistem kreator konten Indonesia.',
  email: 'taptiptup.support@gmail.com',
  whatsapp: '+62 895-1309-3406',
  phone: '+62 895-1309-3406',
  github: 'github.com/khoirulhudaaa',
  Link: 'taptiptup.id',
  instagram: '@taptiptup.official',
  website: 'taptiptup.id',
  location: 'Cirebon, Indonesia',
  timezone: 'WIB (UTC+7)',
  availableHours: 'Senin – Minggu, 08.00 – 20.00 WIB',
};

const PLATFORM = {
  name: 'TapTipTup',
  tagline: 'Platform donasi & monetisasi untuk kreator Indonesia',
  email: 'taptiptup.support@gmail.com',
  emailBiz: 'taptiptup.support@gmail.com',
  whatsapp: '+62 895-1309-3406',
  instagram: '@taptiptup.official',
  website: 'taptiptup.id',
  location: 'Jakarta Selatan, Indonesia',
  address: 'Jl. Cideng Jaya No. 299, Jawa Barat',
  operationalHours: 'Senin – Minggu, 08.00 – 22.00 WIB',
  responseTime: 'Maks. 1×24 jam',
  established: '2026',
};

const ContactCard = ({ icon, label, value, href, mono = false }) => (
  <a
    href={href || '#'}
    target={href && href !== '#' ? '_blank' : undefined}
    rel="noreferrer"
    className={`group flex items-start gap-3.5 p-4 rounded-none border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-100 dark:hover:border-blue-800 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-blue-900/20 transition-all duration-300 ${href && href !== '#' ? 'cursor-pointer' : 'cursor-default'}`}
  >
    <div className="w-9 h-9 rounded-none bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-blue-500 dark:text-blue-400 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm font-bold text-slate-700 dark:text-slate-200 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
    {href && href !== '#' && (
      <ExternalLink size={13} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors ml-auto flex-shrink-0 mt-1" />
    )}
  </a>
);

export const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-transparent">

      {/* Hero — gradient stays dark by design */}
      <motion.div
        className="relative overflow-hidden rounded-none mx-0 mb-8 px-4 md:px-8 py-12"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-none border border-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-none border border-white/5" />
        <div className="absolute top-8 right-40 w-3 h-3 rounded-none bg-blue-400/30" />

        <div className="relative z-[2] max-w-full">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-none bg-white/10 flex items-center justify-center">
              <Headphones size={16} className="text-white/80" />
            </div>
            <span className="text-white/50 text-xs font-black uppercase tracking-widest">Bantuan & Kontak</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
            Apa yang perlu Kami bantu 🥸 ?
          </h1>
          <p className="text-white/50 text-sm font-medium leading-relaxed">
            Tim kami siap membantu kamu. Hubungi developer atau admin platform melalui kanal yang tersedia di bawah.
          </p>
          <img src="/jellyfish.png" alt="icon" className="md:flex hidden w-[16%] opacity-90 z-[1] absolute top-[10%] right-[-60px] -rotate-40" />
        </div>

        <div className="relative z-2 hidden md:grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
          {[
            { val: '1x24 Jam', label: 'Avg. Response'     },
            { val: '98%',      label: 'Resolved Tickets'  },
            { val: '24/7',     label: 'System Monitor'    },
            { val: '2026',     label: 'New Generation'    },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-xl font-black text-white">{s.val}</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <SuggestionsManager />

      <div className="space-y-8">

        {/* ── Developer Section ── */}
        <motion.div {...fadeUp(0.05)} className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden">

          <div className="px-4 md:px-8 pt-8 pb-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-start gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{DEVELOPER.name}</h3>
                  <span className="md:px-2.5 py-1 md:bg-blue-50 dark:md:bg-blue-950/40 text-blue-600 dark:text-blue-400 md:rounded-none text-[10px] font-black uppercase tracking-widest">
                    Developer
                  </span>
                </div>
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400 mt-0.5">{DEVELOPER.role}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2 leading-relaxed max-w-full">{DEVELOPER.bio}</p>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 py-7 space-y-7">

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Kontak Langsung</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<Mail size={16} />}          label="Email"    value={DEVELOPER.email}    href={`mailto:${DEVELOPER.email}`} />
                <ContactCard icon={<MessageCircle size={16} />} label="WhatsApp" value={DEVELOPER.whatsapp} href={`https://wa.me/${DEVELOPER.whatsapp.replace(/\D/g, '')}`} />
                <ContactCard icon={<Phone size={16} />}         label="Telepon"  value={DEVELOPER.phone}    href={`tel:${DEVELOPER.phone.replace(/\D/g, '')}`} />
                <ContactCard icon={<Globe size={16} />}         label="Website"  value={DEVELOPER.website}  href={`https://${DEVELOPER.website}`} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Media Sosial</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<GitBranch size={16} />} label="GitHub"    value={DEVELOPER.github}    href={`https://${DEVELOPER.github}`} mono />
                <ContactCard icon={<Link2 size={16} />}     label="Link"      value={DEVELOPER.Link}      href={`https://${DEVELOPER.Link}`} />
                <ContactCard icon={<AtSign size={16} />}    label="Instagram" value={DEVELOPER.instagram} href={`https://instagram.com/${DEVELOPER.instagram.replace('@', '')}`} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Informasi Lain</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<MapPin size={16} />} label="Lokasi"       value={DEVELOPER.location} />
                <ContactCard icon={<Clock size={16} />}  label="Timezone"     value={DEVELOPER.timezone} />
                <ContactCard icon={<Clock size={16} />}  label="Jam Tersedia" value={DEVELOPER.availableHours} />
                <ContactCard icon={<Code2 size={16} />}  label="Spesialisasi" value="Fullstack · React · Node.js" />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── Platform Section ── */}
        <motion.div {...fadeUp(0.1)} className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 overflow-hidden">

          <div className="px-4 md:px-8 pt-8 pb-6 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-start gap-5">
              <div
                className="w-16 h-16 rounded-none flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
              >
                <Sparkles size={24} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{PLATFORM.name}</h3>
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-none text-[10px] font-black uppercase tracking-widest">
                    Platform
                  </span>
                  <span className="md:px-2.5 py-1 md:bg-green-50 dark:md:bg-green-950/40 text-green-600 dark:text-green-400 rounded-none text-[10px] font-black uppercase tracking-widest hidden md:flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-none animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed max-w-lg">{PLATFORM.tagline}</p>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 py-7 space-y-7">

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Kontak Support</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<Mail size={16} />}          label="Email Support"  value={PLATFORM.email}    href={`mailto:${PLATFORM.email}`} />
                <ContactCard icon={<Mail size={16} />}          label="Email Bisnis"   value={PLATFORM.emailBiz} href={`mailto:${PLATFORM.emailBiz}`} />
                <ContactCard icon={<MessageCircle size={16} />} label="WhatsApp Admin" value={PLATFORM.whatsapp} href={`https://wa.me/${PLATFORM.whatsapp.replace(/\D/g, '')}`} />
                <ContactCard icon={<Globe size={16} />}         label="Website"        value={PLATFORM.website}  href={`https://${PLATFORM.website}`} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Media Sosial Platform</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<AtSign size={16} />} label="Instagram" value={PLATFORM.instagram} href={`https://instagram.com/${PLATFORM.instagram.replace('@', '')}`} />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Informasi Operasional</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ContactCard icon={<Clock size={16} />}  label="Jam Operasional" value={PLATFORM.operationalHours} />
                <ContactCard icon={<Send size={16} />}   label="Waktu Respons"   value={PLATFORM.responseTime} />
                <ContactCard icon={<MapPin size={16} />} label="Alamat"          value={PLATFORM.address} />
                <ContactCard icon={<Shield size={16} />} label="Berdiri Sejak"   value={PLATFORM.established} />
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── FAQ Quick ── */}
        <motion.div {...fadeUp(0.15)} className="bg-white dark:bg-slate-900 rounded-none border border-slate-100 dark:border-slate-800 px-4 md:px-8 py-7">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Pertanyaan Umum</p>
          <div className="space-y-3">
            {[
              { q: 'Berapa lama proses penarikan dana?',   a: 'Proses penarikan manual dilakukan admin dalam 1×24 jam di hari kerja.' },
              { q: 'Apakah ada biaya untuk membuat akun?', a: 'Tidak. TapTipTup gratis untuk semua streamer. Kami hanya mengambil fee kecil per transaksi.' },
              { q: 'Bagaimana cara pasang widget di OBS?', a: 'Salin Widget URL dari menu Editor Overlay lalu tambahkan sebagai Browser Source di OBS.' },
              { q: 'Kenapa donasi saya belum masuk?',      a: 'Pastikan status pembayaran sudah Settlement di Midtrans. Jika sudah 1 jam belum masuk, hubungi support.' },
              { q: 'Apakah bisa ganti metode pembayaran?', a: 'Semua metode pembayaran Midtrans tersedia: QRIS, transfer bank, e-wallet, kartu kredit.' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{item.q}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom CTA — gradient stays dark by design ── */}
        <motion.div
          {...fadeUp(0.2)}
          className="rounded-none px-6 md:px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)' }}
        >
          <div className="w-12 h-12 rounded-none bg-white/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={22} className="text-white/80" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Masih ada pertanyaan?</h3>
          <p className="text-white/50 text-sm font-medium mb-6">Hubungi kami langsung via WhatsApp, respons lebih cepat.</p>
          <a
            href={`https://wa.me/${PLATFORM.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="md:inline-flex w-full md:w-max flex justify-center items-center gap-2.5 px-6 py-3.5 bg-white text-slate-800 rounded-none font-black text-sm hover:bg-slate-100 active:scale-[0.97] transition-all"
          >
            <MessageCircle size={16} className="text-green-500" />
            Chat WhatsApp Admin
          </a>
        </motion.div>

      </div>
    </div>
  );
};