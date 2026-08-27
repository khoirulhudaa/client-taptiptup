  import axios from 'axios';
  import { AnimatePresence, motion } from 'framer-motion';
  import { 
    AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Moon, Sun, User, 
    ShieldCheck, ArrowLeft, Clock, Loader2 
  } from 'lucide-react';
  import { useState, useEffect } from 'react';
  import { useNavigate, useSearchParams } from 'react-router-dom';
  import { sanitizeInput, isValidEmail, isValidUsername, validatePassword, detectXSS, safeText } from '../utils/xssProtection';
  import { useMaintenance } from '../hooks/useMaintenance';
  import MaintenanceScreen from '../components/MaintenanceScreen';

  // ─── Theme tokens ──────────────────────────────────────────────────────────────
  const getTheme = (dark) => ({
    pageBg:           dark ? '#0f0c29'                       : '#ffff',
    rightBg:          dark ? '#13111f'                       : '#ffffff',
    inputBg: dark ? 'rgba(255,255,255,0.04)' : 'rgba(79,70,229,0.04)',
    inputBgFocus: dark ? 'rgba(255,255,255,0.08)' : 'rgba(79,70,229,0.07)',
    inputBorder: dark ? 'rgba(255,255,255,0.10)' : 'rgba(79,70,229,0.18)',
    inputBorderFocus: dark ? 'rgba(99,102,241,0.6)' : 'rgba(79,70,229,0.8)',
    tabBg:            dark ? 'rgba(255,255,255,0.04)'        : 'rgba(79,70,229,0.06)',
    tabBorder:        dark ? 'rgba(255,255,255,0.2)'        : 'rgba(79,70,229,0.14)',
    tabInactive:      dark ? 'white'                       : '#94a3b8',
    divider:          dark ? 'rgba(255,255,255,0.2)'        : 'rgba(0,0,0,0.08)',
    dividerText:      dark ? '#ffffff'                       : '#94a3b8',
    toggleBg:         dark ? 'rgba(255,255,255,0.08)'        : 'rgba(79,70,229,0.08)',
    toggleColor:      dark ? '#a5b4fc'                       : '#2754FF',
    heading:          dark ? '#ffffff'                       : '#1e1b4b',
    subtext:          dark ? 'white'                       : '#64748b',
    label:            dark ? '#818cf8'                       : '#2754FF',
    inputText:        dark ? 'black'                       : '#black',
    iconDefault:      dark ? '#94a3b8'                       : '#94a3b8',
    switchText:       dark ? 'white'                       : '#64748b',
    switchLink:       dark ? '#818cf8'                       : '#2754FF',
    backBtn:          dark ? '#94a3b8'                       : '#64748b',
    forgotColor:      dark ? '#818cf8'                       : '#2754FF',
    forgotHover:      dark ? '#a78bfa'                       : '#7c3aed',
  });

  // ─── Background Canvas ─────────────────────────────────────────────────────────
  // const BgCanvas = () => (
  //   <div className="absolute inset-0 overflow-hidden pointer-events-none">
  //     <div style={{ 
  //       position:'absolute', top:'-80px', left:'-60px', width:'420px', height:'420px', 
  //       borderRadius:'0%', background:'radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 70%)' 
  //     }} />
  //     <div style={{ 
  //       position:'absolute', bottom:'-100px', right:'-80px', width:'360px', height:'360px', 
  //       borderRadius:'0%', background:'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' 
  //     }} />
  //     <svg width="100%" height="100%" style={{ opacity:0.06 }}>
  //       <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
  //         <circle cx="1.5" cy="1.5" r="1.5" fill="white" />
  //       </pattern>
  //       <rect width="100%" height="100%" fill="url(#dots)" />
  //     </svg>
  //   </div>
  // );

  // ─── Notification Modal ────────────────────────────────────────────────────────
  const NotifModal = ({ notification, onClose }) => (
    <AnimatePresence>
      {notification.show && (
        <div className='fixed z-[9999] w-screen h-screen flex justify-center items-center'>
          <motion.div 
            initial={{ opacity:0 }} 
            animate={{ opacity:1 }} 
            exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(15,15,30,0.75)', backdropFilter:'blur(10px)' }}
            onClick={onClose} 
          />
          <motion.div
            initial={{ opacity:0, scale:0.88, y:28 }} 
            animate={{ opacity:1, scale:1, y:0 }} 
            exit={{ opacity:0, scale:0.88, y:28 }}
            transition={{ type:'spring', stiffness:340, damping:30 }}
            style={{ position:'fixed', zIndex:101, transform:'translate(-50%,-50%)', width:'92vw', maxWidth:400 }}
          >
            <div style={{ 
              background:'rgba(255,255,255,0.97)',
              borderRadius: 10,
              padding:'36px 32px', 
              boxShadow:'0 32px 80px rgba(0,0,0,0.22)', textAlign:'center' 
            }}>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} 
                transition={{ type:'spring', stiffness:400, damping:20, delay:0.1 }}
                style={{ 
                  width:68, height:68, margin:'0 auto 20px', display:'flex', 
                  alignItems:'center', justifyContent:'center', 
                  borderRadius: 10,
                  background: notification.type==='success' ? '#ecfdf5' : '#fff1f2', 
                  color: notification.type==='success' ? '#059669' : '#e11d48' 
                }}
              >
                {notification.type==='success' ? <CheckCircle2 size={34}/> : <AlertCircle size={34}/>}
              </motion.div>
              <h3 style={{ fontSize:20, fontWeight:900, color:'#1e1b4b', marginBottom:8 }}>
                {notification.title}
              </h3>
              <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, marginBottom:24 }}>
                {notification.message}
              </p>
              <button className='
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
              cursor-pointer active:scale-[0.99]' onClick={onClose}
                style={{ 
                  width:'100%', padding:'14px 0', borderRadius:10, fontWeight:900, fontSize:14, 
                  border:'none',  
                  background: notification.type==='success' ? '#2754FF' : '#e11d48', 
                  color:'white', transition:'opacity 0.2s' 
                }}
                onMouseEnter={e => e.target.style.opacity='0.88'} 
                onMouseLeave={e => e.target.style.opacity='1'}
              >
                {notification.type==='success' ? 'Lanjutkan →' : 'Coba Lagi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // ─── Auth Input Component ─────────────────────────────────────────────────────
  const AuthInput = ({ icon: Icon, type='text', label, value, onChange, placeholder, T, id, autoComplete, className = "" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = type === 'password';

    const handleChange = (inputValue) => {
      const sanitized = sanitizeInput(inputValue);
      onChange(sanitized);
    };

    return (
      <div
        className="w-full h-[56px] flex p-1 items-center rounded-xl overflow-hidden transition-all shadow-sm"
        style={{
          border: `1px solid ${focused ? T.inputBorderFocus : 'black'}`,
          background: 'white',
          transition: 'all 0.2s',
        }}
      >
        <div
          className="flex items-center rounded-lg justify-center bg-blue-600 flex-shrink-0 h-full px-3 w-13 py-0"
          style={{
            color: 'white',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          <Icon size={18} />
        </div>

        {/* Input */}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={e => handleChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          id={id}
          autoComplete={autoComplete}
          style={{
            flex: 1,
            background: 'white',
            border: 'none',
            padding: '15px 12px',
            color: T.inputText,
            fontSize: 15,
            WebkitBoxShadow: '0 0 0px 1000px white inset',
            WebkitTextFillColor: T.inputText,
            fontWeight: 600,
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
          }}
          className={`auth-input-field focus:bg-white ${className}`}
        />

        {/* Toggle password */}
        {isPassword && (
          <button
            className='w-14 h-full flex justify-center items-center'
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: T.iconDefault, display: 'flex',
              flexShrink: 0,
            }}
          >
            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        )}
      </div>
    );
  };

  // ─── LEFT PANEL ───────────────────────────────────────────────────────────────
  const LeftPanel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = ['/fr1.jpg', '/fr2.png', '/fr5.jpg', '/fr6.png'];

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="auth-left md:h-[100vh] h-max" style={{
        position: 'relative', width: '37.5vw',
        background: 'linear-gradient(145deg, #312e81 0%, #2754FF 45%, #6d28d9 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '0', overflow: 'hidden',
      }}>
        {/* Desktop: carousel f1–f4 */}
        <div className="md:flex hidden absolute inset-0 z-[999]">
          {slides.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`slide ${i + 1}`}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: i === currentSlide ? 1 : 0,
                transition: 'opacity 0.7s ease',
              }}
            />
          ))}

          {/* Dot navigator */}
          <div style={{
            position: 'absolute', bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 8, zIndex: 10,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                style={{
                  width: i === currentSlide ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.45)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Mobile: tetap img1 & img2 */}
        <img src="/img2.jpg" alt="img" className='md:hidden flex relative w-full h-full object-cover z-[999]' />
      </div>
    );
  };

  // ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
  const ThemeToggle = ({ isDark, onToggle }) => (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.97 }}
      className="relative border border-blue-500 md:top-[-12px] top-[-2px] left-[0px] mb-8 z-20"
      style={{
        width: 52, height: 28,
        borderRadius: 7,
        background: isDark ? '#4f46e5' : '#e2e8f0',
        // border: 'none', 
        cursor: 'pointer', padding: 0,
        outline: 'none', transition: 'background 0.3s ease',
        display: 'flex', alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Thumb + icon */}
      <motion.div
        className='h-[70%]'
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position: 'absolute',
          // top: '2.62px',
          left: isDark ? 25 : 5,
          width: 20, 
          // height: 20,
          borderRadius: 4,
          background: isDark ? '#818cf8' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'left 0.3s ease, background 0.3s ease',
          color: isDark ? 'white' : '#f59e0b',
        }}
      >
        {isDark ? <Moon size={11} /> : <Sun size={11} />}
      </motion.div>
    </motion.button>
  );

  // ─── RIGHT PANEL WRAPPER ──────────────────────────────────────────────────────
  const RightPanel = ({ T, isDark, setIsDark, children }) => (
    <div className='md:min-h-[100vh] h-max mx-auto !px-4 w-[100%] !justify-center !items-center!md:flex pb-8 md:pb-[40px] md:py-[40px] md:!px-[30px] py-[20px]' 
      style={{
        flex:1, position:'relative', rightBg: isDark ? '#13111f' : '#bfdbfe',
        alignItems:'center', justifyContent:'center', transition:'background 0.35s',
      }}
    >
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} T={T} />
      <div style={{ width:'100%', maxWidth: '100%', marginTop: 16 }} className='md:h-[80vh] flex flex-col justify-center'>
        {children}
      </div>
    </div>
  );

  // ─── MAIN AUTH FORM ───────────────────────────────────────────────────────────
  const MainAuthForm = ({ 
      T, isLogin, setIsLogin, loading, formData, setFormData, 
      isTabActive, handleSubmit, setCurrentPage, isDark 
    }) => {
      // State untuk error messages
      const [errors, setErrors] = useState({ username: '', email: '', password: '' });
      
      useEffect(() => {
        setErrors({ username: '', email: '', password: '' });
      }, [isLogin]);

      // Validasi form sebelum submit
      const validateForm = () => {
        const newErrors = { username: '', email: '', password: '' };
        let isValid = true;
        
        if (!isLogin) {
          // Validasi username
          if (!formData.username) {
            newErrors.username = 'Username wajib diisi';
            isValid = false;
          } else if (!isValidUsername(formData.username)) {
            newErrors.username = 'Username 3-20 karakter (huruf, angka, _, -)';
            isValid = false;
          }
          
          // Cek XSS di username
          if (detectXSS(formData.username)) {
            newErrors.username = 'Username tidak valid';
            isValid = false;
          }
        }
        
        // Validasi email
        if (!formData.email) {
          newErrors.email = 'Email wajib diisi';
          isValid = false;
        } else if (!isValidEmail(formData.email)) {
          newErrors.email = 'Format email tidak valid';
          isValid = false;
        }
        
        // Cek XSS di email
        if (detectXSS(formData.email)) {
          newErrors.email = 'Email tidak valid';
          isValid = false;
        }
        
        // Validasi password
        if (!formData.password) {
          newErrors.password = 'Password wajib diisi';
          isValid = false;
        } else if (formData.password.length < 6) {
          newErrors.password = 'Password minimal 6 karakter';
          isValid = false;
        }
        
        // Cek XSS di password
        if (detectXSS(formData.password)) {
          newErrors.password = 'Password tidak valid';
          isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };
      
    // Wrapper handleSubmit dengan validasi
    const handleFormSubmit = (e) => {
      e.preventDefault();
      if (!validateForm()) return;     // ← Perbaikan
      handleSubmit(e);
    };
    const isFormValid = formData.email && formData.password && (isLogin || formData.username);

    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key="main-form"
          initial={{ opacity:0, y:20 }} 
          animate={{ opacity:1, y:0 }} 
          exit={{ opacity:0, y:-20 }}
          transition={{ duration:0.22 }}
        >
          <div className='mb-[24px] md:mb-[28px] leading-0 md:leading-[1.2]'>
            <h2 style={{ 
              fontSize:28, fontWeight:900, color: T.heading, 
              letterSpacing:'-0.01em', transition:'color 0.35s' 
            }}>
              {isLogin ? 'Masuk ke Dashboard' : 'Buat Akun Baru'}
            </h2>
            <p className='md:mt-[8px] mt-[24px]' style={{ color: T.subtext, fontSize:14, lineHeight:1.55 }}>
              {isLogin 
                ? 'Waktunya mengelola overlay mu' 
                : 'Daftar mulai kustom alert mu'
              }
            </p>
          </div>

          <div
            className='md:!mb-[24px] !mb-[8px]'
            style={{
              display: 'flex',
              border: `1px solid ${!isDark ? 'black' : '#ffffff80'}`,
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
              background: T.tabTrack,  // warna track, misal '#f5f5f5'
              padding: 4,
            }}>

            {/* slider indicator */}
            <div style={{
              position: 'absolute',
              top: 4, bottom: 4,
              left: 4,
              width: 'calc(50% - 4px)',
              background: '#2754FF',
              borderRadius: 7,
              transform: isLogin ? 'translateX(0)' : 'translateX(calc(100%))',
              transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: 'none',
            }} />

            {[{ label: 'Masuk' }, { label: 'Daftar' }].map(({ label }, i) => (
              <button key={label} onClick={() => setIsLogin(i === 0)} style={{
                flex: 1,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: 'transparent',
                borderRadius: 7,
                position: 'relative',
                zIndex: 1,
                color: isLogin === (i === 0) ? 'white' : T.tabInactive,
                transition: 'color 0.2s',
              }}>{label}</button>
            ))}
          </div>
          
          <form onSubmit={handleFormSubmit}>
            <motion.div 
              key={`main-form-${isLogin}`}  // ← tambah isLogin di sini
              initial={{ opacity:0, x: isLogin ? -24 : 24 }} 
              animate={{ opacity:1, x:0 }} 
              exit={{ opacity:0, x: isLogin ? 24 : -24 }}
              transition={{ duration:0.22 }}
              style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:20 }}>
              <div className={`grid ${isLogin ? 'grid-cols-1' : ' grid-cols-1 md:grid-cols-2 mt-5.5'} gap-4`}>
                  {!isLogin && (
                    <AuthInput 
                      label={'Username'}
                      icon={User} 
                      placeholder="Username" 
                      value={formData.username} 
                      onChange={v => setFormData(f => ({ ...f, username:v }))} 
                      T={T} 
                    />
                )}
                {!isLogin && (
                  <AuthInput 
                    label={'PIN'}
                    icon={ShieldCheck} 
                    type="text" 
                    maxLength={4}
                    placeholder="PIN Keamanan (4 digit)" 
                    value={formData.securityPin || ''} 
                    onChange={v => setFormData(f => ({ ...f, securityPin: v.replace(/\D/g,'').slice(0,4) }))} 
                    T={T} 
                  />
                )}
              </div>
              <div className={`grid ${!isLogin ? 'md:grid-cols-2' : 'md:grid-cols-1' } grid-cols-1 gap-4`}>
                <AuthInput 
                  label={'Email'}
                  icon={Mail} 
                  id="login-email"
                  autoComplete="email"
                  type="email" 
                  placeholder="Alamat Email" 
                  value={formData.email} 
                  onChange={v => setFormData(f => ({ ...f, email:v }))} 
                  T={T} 
                  />
                {errors.username && (
                  <p style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 12 }}>
                    {errors.username}
                  </p>
                )}
                <AuthInput 
                  label={'Password'}
                  icon={Lock} 
                  id="login-password123"
                  autoComplete="password"
                  type="password" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={v => setFormData(f => ({ ...f, password:v }))} 
                  T={T} 
                />
              </div>
            </motion.div>

            <div className={`${isLogin ? '' : 'opacity-0'} uppercase`} style={{ textAlign:'left', marginBottom: 10 }}>
              <button className='uppercase' type="button" onClick={() => setCurrentPage('forgot-password')}
                style={{ 
                  background:'none', border:'none', cursor:'pointer', 
                  color: T.forgotColor, fontSize:13, fontWeight:700, 
                  transition:'color 0.2s' 
                }}
                onMouseEnter={e => e.currentTarget.style.color=T.forgotHover}
                onMouseLeave={e => e.currentTarget.style.color=T.forgotColor}
              >
                Lupa Password?
              </button>
            </div>

            <button type="submit" disabled={!isFormValid || loading} 
              className="submit-btn
                text-slate-900 dark:text-white 
          bg-slate-100 dark:bg-white/20
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
              "
              style={{ 
                width:'100%', padding:'16px 0', borderRadius:10, fontWeight:900, fontSize:15, 
                border:'none', cursor:'pointer', 
                background: isFormValid ? 'linear-gradient(135deg, #2754FF 0%, #7c3aed 100%)' : '#e2e8f0',
                color: isFormValid ? 'white' : '#64748b', 
                opacity: loading ? 0.65 : 1, display:'flex', alignItems:'center', 
                justifyContent:'center', gap:8, 
                // boxShadow: isFormValid ? '0 8px 32px rgba(79,70,229,0.4)' : 'none',
                transition:'all 0.2s'
              }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Masuk Dashboard' : 'Daftar Sekarang'}
                  <ArrowRight size={16}/>
                </>
              )}
            </button>
          </form>

          <p className='mt-3 md:mt-6 font-bold uppercase' style={{ textAlign:'left', color: T.heading, fontSize:14 }}>
            {isLogin ? 'Belum punya akun ?' : 'Sudah punya akun ?'}{' '}
            <button onClick={() => setIsLogin(!isLogin)}
              style={{ 
                background:'none', border:'none', cursor:'pointer', 
                color: T.switchLink, fontWeight:800, fontSize:14, marginLeft: 1 
              }}
              onMouseEnter={e => e.currentTarget.style.color='#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.color=T.switchLink}
            >
              {isLogin ? 'DAFTAR GRATIS' : 'MASUK SEKARANG'}
            </button>
          </p>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ─── FORGOT PASSWORD PAGE ────────────────────────────────────────────────────
  // ─── FORGOT PASSWORD PAGE (VERSI BARU - Pakai Security PIN) ───────────────────
  const ForgotPasswordPage = ({ 
    T, 
    setCurrentPage, 
    emailReset, 
    setEmailReset, 
    setTempEmail, 
    setTempToken,
    notify 
  }) => {
    
    const [step, setStep] = useState(1); // 1 = Masukkan Email, 2 = Masukkan PIN
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');   // ← WAJIB DITAMBAHKAN

    // Step 1: Cek Email
    const handleCheckEmail = async () => {
      setError('');
      
      if (!emailReset) {
        setError('Email wajib diisi');
        return;
      }
      if (!isValidEmail(emailReset)) {
        setError('Format email tidak valid');
        return;
      }
      if (detectXSS(emailReset)) {
        setError('Email tidak valid');
        return;
      }

      setLoading(true);
      try {
        const res = await axios.post('https://server-taptiptup.vercel.app/api/auth/forgot-password', {
          email: sanitizeInput(emailReset)
        });
        
        notify('Email Ditemukan', 'Masukkan PIN Keamanan 4 digit Anda', 'success');
        setStep(2);
      } catch (err) {
        notify('Gagal', err.response?.data?.message || 'Email tidak terdaftar', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Step 2: Verifikasi Security PIN
    const handleVerifyPin = async () => {
      if (pin.length !== 4) {
        setError('PIN harus 4 digit');
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        const res = await axios.post('https://server-taptiptup.vercel.app/api/auth/verify-security-pin', {
          email: sanitizeInput(emailReset),
          securityPin: pin
        });

        setTempEmail(emailReset);
        setTempToken(res.data.tempToken);
        setCurrentPage('reset-password');
        
      } catch (err) {
        setError(err.response?.data?.message || 'PIN salah');
        setPin('');
      } finally {
        setLoading(false);
      }
    };

    return (
      <motion.div 
        key="forgot" 
        initial={{ opacity:0, y:20 }} 
        animate={{ opacity:1, y:0 }} 
        exit={{ opacity:0, y:-20 }}
      >
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <div style={{ 
            width: 72, height: 72, margin: '50px 0 20px 0px', 
            background: '#fef3c7', borderRadius: 20, 
            display: 'flex', alignItems: 'center', justifyContent: 'center'  
          }}>
            <Mail size={32} style={{ color: '#d97706' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: T.heading, marginBottom: 8 }}>
            {step === 1 ? 'Lupa Password?' : 'Masukkan PIN Keamanan'}
          </h2>
          <p style={{ color: T.subtext, fontSize:14, lineHeight:1.6 }}>
            {step === 1 
              ? 'Masukkan email yang terdaftar' 
              : `Masukkan PIN 4 digit untuk akun\n${emailReset}`}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, 
            padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center' 
          }}>
            <AlertCircle size={16} style={{ color: '#ef4444', marginRight: 8 }} />
            <span style={{ color: '#dc2626', fontSize: 13 }}>{error}</span>
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:16, height: '100%' }}>
          {step === 1 ? (
            <>
              <AuthInput 
                label={'Email'}
                icon={Mail} 
                placeholder="Email kamu" 
                value={emailReset} 
                onChange={setEmailReset} 
                T={T} 
              />
              <button 
                onClick={handleCheckEmail} 
                disabled={loading || !emailReset}
                className='
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
                text-center flex justify-center items-center active:scale-[0.99]'
                style={{ 
                  width:'100%', padding:'16px 0', borderRadius:10, fontWeight:900, fontSize:14, 
                  border:'none', cursor:'pointer', 
                  background: emailReset ? 'linear-gradient(135deg, #2754FF, #7c3aed)' : '#e2e8f0', 
                  color: emailReset ? 'white' : '#64748b', 
                  opacity: loading ? 0.6 : 1 
                }}
              >
                {loading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'Lanjutkan →'}
              </button>
                <button 
                onClick={() => setCurrentPage('main')}
                className='active:scale-[0.99] w-max justify-end text-right hover:brightness-80'
                style={{ 
                  border:'none', cursor:'pointer', 
                  color: T.backBtn, fontSize:14, fontWeight:700, 
                  display:'flex', alignItems:'center', gap:6 
                }}
              >
                <ArrowLeft size={18} /> Kembali sekarang
              </button>

            </>
          ) : (
            <>
              <AuthInput 
                label={'PIN'}
                icon={ShieldCheck} 
                type="text" 
                maxLength={4}
                placeholder="PIN Keamanan 4 Digit" 
                value={pin} 
                onChange={(v) => setPin(v.replace(/\D/g, '').slice(0,4))} 
                T={T} 
              />
              <button 
                onClick={handleVerifyPin} 
                disabled={loading || pin.length !== 4}
                className={`flex justify-center items-center active:scale-[0.99] text-center`}
                style={{ 
                  width:'100%', padding:'16px 0', borderRadius:10, fontWeight:900, fontSize:14, 
                  border:'none', cursor:'pointer', 
                  background: pin.length === 4 ? '#2754FF' : '#e2e8f0', 
                  color: pin.length === 4 ? 'white' : '#64748b', 
                  opacity: loading ? 0.6 : 1 
                }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifikasi Kode PIN'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // ─── VERIFY PIN PAGE ─────────────────────────────────────────────────────────
  const VerifyPinPage = ({ T, notify, closeNotif, navigate, email }) => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(300); // 5 minutes

    useEffect(() => {
      const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e) => {
      e.preventDefault();
      if (pin.length !== 6) return;
      
      setLoading(true);
      try {
        const res = await axios.post('https://server-taptiptup.vercel.app/api/auth/verify-pin', {
          email, pin
        });
        notify('Verifikasi Berhasil!', res.data.message, 'success');
        setTimeout(() => navigate('/auth'), 2000);
      } catch (err) {
        notify('Gagal', err.response?.data?.message || 'PIN salah atau kadaluarsa', 'error');
        setPin('');
      } finally {
        setLoading(false);
      }
    };

    const handleResend = async () => {
      if (countdown > 0) return;
      setResendLoading(true);
      try {
        const res = await axios.post('https://server-taptiptup.vercel.app/api/auth/resend-pin', { email });
        notify('PIN Baru Dikirim!', res.data.message, 'success');
        setCountdown(300);
      } catch (err) {
        notify('Gagal', err.response?.data?.message, 'error');
      } finally {
        setResendLoading(false);
      }
    };

    return (
      <motion.div 
        key="verify-pin" 
        initial={{ opacity:0, y:20 }} 
        animate={{ opacity:1, y:0 }} 
        exit={{ opacity:0, y:-20 }}
      >
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <div style={{ 
            width: 80, height: 80, margin: '50px 0 24px 0px', background: '#eff6ff', 
            borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <ShieldCheck size={36} style={{ color: '#2754FF' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: T.heading, marginBottom: 8 }}>
            Verifikasi PIN
          </h2>
          <p style={{ color: T.subtext, fontSize:14 }}>
            Masukkan 6 digit kode yang dikirim ke <strong>{email}</strong>
          </p>
          {countdown > 0 && (
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
              background: '#dbeafe', borderRadius: 999, padding: '8px 16px', marginTop: 12 
            }}>
              <Clock size={16} style={{ color: '#1e40af' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
                {formatTime(countdown)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: 24 }}>
            <input
              type="text" 
              maxLength={6} 
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').toUpperCase())}
              placeholder="000000"
              style={{
                width: '100%', boxSizing: 'border-box', background: T.inputBgFocus,
                border: `2px solid ${T.inputBorderFocus}`, borderRadius: 16, 
                padding: '24px 20px', fontSize: 32, fontWeight: 800, 
                textAlign: 'center', letterSpacing: '12px', 
                color: T.inputText, outline: 'none', fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || pin.length !== 6}
            className="submit-btn"
            style={{ 
              width: '100%', padding: '18px 0', borderRadius: 16, fontWeight: 900, fontSize: 15, 
              border: 'none', cursor: 'pointer', 
              background: pin.length === 6 ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
              color: pin.length === 6 ? 'white' : '#64748b', 
              opacity: loading ? 0.7 : 1 
            }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifikasi PIN'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button 
            onClick={handleResend} 
            disabled={resendLoading || countdown > 0}
            style={{ 
              background: 'none', border: 'none', color: T.forgotColor, 
              fontSize: 14, fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer',
              opacity: countdown > 0 ? 0.5 : 1 
            }}
          >
            {resendLoading ? 'Mengirim...' : countdown > 0 ? `Kirim ulang ${formatTime(countdown)}` : 'Kirim ulang PIN'}
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── RESET PASSWORD PAGE ─────────────────────────────────────────────────────
  const ResetPasswordPage = ({ T, notify, closeNotif, navigate, emailProp, tokenProp, setCurrentPage, setIsLogin }) => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });

    // ← Prioritas: dari props dulu, fallback ke URL params
    const token = tokenProp || searchParams.get('token');
    const email = emailProp || searchParams.get('email');

    // Update handler untuk password dengan validasi
    const handlePasswordChange = (password) => {
      const sanitized = sanitizeInput(password);
      setFormData(f => ({ ...f, password: sanitized }));
      
      // Update password strength
      if (sanitized) {
        setPasswordStrength(validatePassword(sanitized));
      } else {
        setPasswordStrength({ strength: 0, message: '' });
      }
    };


    
    const handleReset = async (e) => {
      e.preventDefault();
      setError('');
      
      // Validasi password
      if (!formData.password) {
        setError('Password wajib diisi');
        return;
      }
      
      // Validasi password strength
      const pwdValidation = validatePassword(formData.password);
      if (!pwdValidation.isValid) {
        setError('Password minimal 6 karakter');
        return;
      }
      
      // Cek XSS
      if (detectXSS(formData.password)) {
        setError('Password tidak valid');
        return;
      }
      
      // Validasi konfirmasi password
      if (formData.password !== formData.confirmPassword) {
        setError('Password konfirmasi tidak cocok');
        return;
      }
      
      setLoading(true);

      try {
        const res = await axios.post('https://server-taptiptup.vercel.app/api/auth/reset-password', {
          email: sanitizeInput(email),
          token: sanitizeInput(token),
          newPassword: formData.password
        });
        notify('Password Berhasil Diubah!', res.data.message, 'success');
        // setTimeout(() => navigate('/login'), 2500);
        setCurrentPage('main');
        setIsLogin(true);

      } catch (err) {
        setError(err.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (!token || !email) {
        setCurrentPage('main');
        setIsLogin(true);
        // navigate('/login');
      }
    }, [token, email, navigate]);

    if (!token || !email) return null;

    return (
      <motion.div 
        key="reset-password" 
        initial={{ opacity:0, y:20 }} 
        animate={{ opacity:1, y:0 }} 
        exit={{ opacity:0, y:-20 }}
      >
        <button 
          onClick={() => setCurrentPage('main')}
          className='active:scale-[0.99] hover:brightness-80'
          style={{ 
            position: 'absolute', 
            top: 30, 
            marginLeft: '0',
            width: '100%',
            paddingRight: 60,
            background:'none', border:'none', cursor:'pointer', 
            color: T.backBtn, fontSize:14, fontWeight:700, 
            display:'flex', alignItems:'end',
            justifyContent: 'end',
            gap:6 
          }}
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          <div style={{ 
            width: 72, height: 69, margin: '50px 0 20px 0px', 
            background: '#fef3c7', borderRadius: 20, 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <ShieldCheck size={38} style={{ color: '#d97706' }} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: T.heading, marginBottom: 8 }}>
            Reset Password
          </h2>
          <p style={{ color: T.subtext, fontSize:14 }}>
            Buat password baru untuk akun <strong>{email}</strong>
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity:0, height:0 }} 
            animate={{ opacity:1, height: 'auto' }} 
            style={{ 
              background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, 
              padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center' 
            }}
          >
            <AlertCircle size={18} style={{ color: '#ef4444', marginRight: 12 }} />
            <span style={{ color: '#dc2626', fontSize: 14, fontWeight: 500 }}>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleReset}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AuthInput 
              label={'Password'}
              icon={Lock} 
              type="password" 
              placeholder="Password baru (min 6 karakter)" 
              value={formData.password}
              onChange={handlePasswordChange}   // ← GANTI INI (jangan inline)
              T={T}
            />
            {passwordStrength.message && (
              <p style={{ fontSize:13, marginTop:4, color: passwordStrength.strength >= 4 ? '#10b981' : '#eab308' }}>
                {passwordStrength.message}
              </p>
            )}
            <AuthInput 
              label={'Konfirmasi Password'}
              icon={Lock} 
              type="password" 
              placeholder="Konfirmasi password" 
              value={formData.confirmPassword}
              onChange={v => setFormData(f => ({ ...f, confirmPassword: v }))}
              T={T}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="submit-btn flex justify-center items-center text-center rounded-xl"
              style={{ 
                width: '100%', padding: '16px 0', 
                // borderRadius: 0, 
                fontWeight: 900, 
                fontSize: 14, 
                border: 'none', cursor: 'pointer', 
                background: '#2754FF', 
                color: 'white', 
                opacity: loading ? 0.7 : 1 
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Password Baru'}
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  // ─── Security Alert Modal ──────────────────────────────────────────────────
  const SecurityModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='!right-0 ml-auto w-full md:w-[62.5vw] p-0 md:px-[86px] 2xl:p-[0px]'
            style={{
              position: 'fixed', 
              inset: 0, zIndex: 99999,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 32 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 32 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className='w-[90vw] md:w-full h-full flex flex-col items-start justify-center md:!px-[30px] md:!py-[30px] !px-4 !py-[20px]'
              style={{
                background: 'linear-gradient(145deg, #0f0c29, #1a1535)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20,
                width: '100%',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Glow background */}
              <div style={{
                position: 'absolute', 
                top: '-70%', 
                right: '-60%',
                width: 1000, height: 1000,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                style={{
                  width: 80, height: 80,
                  margin: '0 0 24px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1.5px solid rgba(239,68,68,0.4)',
                  borderRadius: 20,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={36} style={{ color: '#ef4444' }} />
              </motion.div>

              {/* Title */}
              <h3 
                className='md:!mb-[10px] !mb-[20px] !text-[11px] md:!text-[22px] !tracking-[0.1em] md:!tracking-[-0.01em] !font-[800] md:!font-[900] !uppercase md:!normal-case'
                style={{
                  color: '#ffffff',
                }}
              >
                Aktivitas Terlarang
              </h3>

              {/* Subtitle */}
              <p 
              className='md:!w-[70%] !w-[100%] md:!text-[14px] !text-[10px] !py-[10px] md:!py-[20px] '
              style={{
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.6,
                // textAlign: 'center', 
                // margin: '10px auto 28px auto'
              }}>
                Tindakan yang kamu lakukan tidak diizinkan di halaman ini.
                Semua aktivitas dicatat dan dipantau.
              </p>

              {/* Warning pills — aktivitas */}
              <div 
                className='w-full grid !grid-cols-2 md:!grid-cols-5'
                style={{
                  gap: 8, 
                  marginBottom: 20,
                }}>
                  {['Screenshot', 'Copy & Paste', 'Klik Kanan', 'DevTools', 'Windows Key'].map(label => (
                    <span 
                    className='w-full'
                    key={label} style={{
                      padding: '12px 14px',
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: 10,
                      fontSize: 12, fontWeight: 700,
                      color: '#fca5a5',
                    }}>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

                {/* Karakter terlarang */}
                <div 
                  className='!md:mb-[24px] w-full !mb-[16px] md:!px-[20px] !px-[0px] !py-[16px] md:rounded-[14px] md:border md:border-[rgba(239,68,68,0.18)] md:bg-[rgba(239,68,68,0.07)]'
                >
                <p 
                  className='!text-[10px] md:!text-[11px] !mb-[12px] md:!mb-[10px]'
                  style={{
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    width: '100%',
                    marginBottom: 12,
                  }}>
                    Karakter yang tidak diizinkan 
                  </p>
                  <div className='grid grid-cols-5 w-max md:w-full' style={{ flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                    {[
                      { char: '<',  name: 'Less Than'    },
                      { char: '>',  name: 'Greater Than' },
                      { char: '&',  name: 'Ampersand'    },
                      { char: ';',  name: 'Semicolon'    },
                      { char: '=',  name: 'Equal Sign'   },
                    ].map(({ char, name }) => (
                      <div 
                      className='w-max md:w-full'
                      key={char} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '12px 12px',
                        textAlign: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8,
                      }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: 18, fontWeight: 900,
                          color: '#f87171',
                          lineHeight: 1,
                          textAlign: 'center',
                          minWidth: 16,
                        }}>
                          {char}
                        </span>
                        <span 
                        className='md:flex hidden'
                        style={{
                          fontSize: 11, fontWeight: 600,
                          color: 'rgba(255,255,255,0.35)',
                          textAlign: 'center',
                          letterSpacing: '0.02em',
                        }}>
                          {name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p 
                  className='md:flex hidden'
                  style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    marginTop: 12, lineHeight: 1.6,
                  }}>
                    Karakter-karakter ini berpotensi digunakan untuk injeksi kode berbahaya dan tidak diperbolehkan di form ini.
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 24 }} />

                {/* Button */}
                <button
                  onClick={onClose}
                  className="active:scale-[0.98]"
                  style={{
                    width: '100%', padding: '14px 0',
                    borderRadius: 12, fontWeight: 900, fontSize: 14,
                    border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    transition: 'filter 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  Ya, Saya Mengerti
                </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
  const Auth = () => {
    const [isDark, setIsDark] = useState(true);
    const T = getTheme(isDark);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tempToken, setTempToken] = useState('');
    const { maintenance, loading: maintenanceLoading } = useMaintenance();

    const [showSecurityModal, setShowSecurityModal] = useState(false);

    // Page state
    const [currentPage, setCurrentPage] = useState('main');
    const [tempEmail, setTempEmail] = useState('');

    // Form state
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username:'', email:'', password:'', securityPin: '' });
    const [emailReset, setEmailReset] = useState('');
    // const [validationErrors, setValidationErrors] = useState({});

    // Notification
    const [notification, setNotification] = useState({ show:false, title:'', message:'', type:'success' });
    const notify = (title, message, type='success') => setNotification({ show:true, title, message, type });
    const closeNotif = () => setNotification(n => ({ ...n, show:false }));

    const triggerSecurityModal = () => setShowSecurityModal(true);

    // Check reset password URL
    useEffect(() => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      if (token && email) {
        setCurrentPage('reset-password');
      }
    }, [searchParams]);

    // Reset form ketika pindah tab
    useEffect(() => {
      if (isLogin) {
        // Saat di Login → hapus username
        setFormData(prev => ({ ...prev, username: '' }));
      } else {
        // Saat di Register → boleh kosong semua atau reset full
        setFormData({ username: '', email: '', password: '' });
      }
    }, [isLogin]);

    useEffect(() => {
      const blockContextMenu = (e) => {
        e.preventDefault();
        setShowSecurityModal(true);
      };

      const blockKeyboard = (e) => {
        const blockedKeys = ['PrintScreen', 'Meta', 'OS', 'Super'];

        // Ctrl+A dan seleksi mouse DIIZINKAN
        // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+P, Ctrl+U DIBLOKIR
        const blockedCtrlCombos = ['c','v','x','s','p','u'];

        const blockedCombos = [
          // Ctrl combo — kecuali Ctrl+A
          e.ctrlKey && blockedCtrlCombos.includes(e.key.toLowerCase()),

          // Semua Meta/Win/Cmd combo
          e.metaKey,

          // DevTools
          e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()),
          e.key === 'F12',

          // Screenshot shortcuts
          e.metaKey && e.shiftKey && e.key.toLowerCase() === 's',
          e.metaKey && e.shiftKey && e.key.toLowerCase() === 'r',
          e.metaKey && e.key.toLowerCase() === 'g',
          e.metaKey && e.altKey && e.key.toLowerCase() === 'r',
          e.metaKey && e.code === 'PrintScreen',
          e.altKey && e.code === 'PrintScreen',
          e.ctrlKey && e.code === 'PrintScreen',
          e.shiftKey && e.code === 'PrintScreen',
          e.metaKey && e.shiftKey && ['3','4','5'].includes(e.key),
          e.metaKey && e.ctrlKey && e.shiftKey && ['3','4'].includes(e.key),
        ];

        const blockedChars = ['<', '>', '&', ';', '='];
        if (blockedChars.includes(e.key)) {
          e.preventDefault();
          setShowSecurityModal(true);
          return;
        }

        if (
          blockedKeys.includes(e.code) ||
          blockedKeys.includes(e.key) ||
          blockedCombos.some(Boolean)
        ) {
          e.preventDefault();
          setShowSecurityModal(true);
        }
      };

      const blockPaste = (e) => {
        e.preventDefault();
        setShowSecurityModal(true);
      };

      const blockCopy = (e) => {
        e.preventDefault();
        setShowSecurityModal(true);
      };

      const blockDrag = (e) => {
        e.preventDefault();
        setShowSecurityModal(true);
      };

      document.addEventListener('contextmenu', blockContextMenu);
      document.addEventListener('keydown', blockKeyboard);
      document.addEventListener('paste', blockPaste);
      document.addEventListener('copy', blockCopy);
      document.addEventListener('cut', blockCopy);
      document.addEventListener('dragstart', blockDrag);

      return () => {
        document.removeEventListener('contextmenu', blockContextMenu);
        document.removeEventListener('keydown', blockKeyboard);
        document.removeEventListener('paste', blockPaste);
        document.removeEventListener('copy', blockCopy);
        document.removeEventListener('cut', blockCopy);
        document.removeEventListener('dragstart', blockDrag);
      };
    }, []);

    if (maintenance?.auth) return (
      <MaintenanceScreen title="Halaman login - maintenance" />
    );

    // Main form submit handler dengan XSS protection
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validasi awal - sanitasi semua input dulu
      const sanitizedData = {
        username: sanitizeInput(formData.username),
        email: sanitizeInput(formData.email),
        password: formData.password,
        securityPin: formData.securityPin || ''
      };

      // Validasi tambahan untuk Register
      if (!isLogin) {
        if (!sanitizedData.securityPin || sanitizedData.securityPin.length !== 4) {
          notify('Validasi Gagal', 'PIN Keamanan harus 4 digit angka', 'error');
          return;
        }
      }
      
      const isFormValid = sanitizedData.email && formData.password && 
                      (isLogin || (sanitizedData.username && sanitizedData.securityPin));

      if (!isFormValid) {
        notify('Validasi Gagal', 'Mohon lengkapi semua field', 'error');
        return;
      }
      
      // CEK XSS sebelum submit
      if (detectXSS(sanitizedData.username) || detectXSS(sanitizedData.email) || detectXSS(formData.password)) {
        notify('Peringatan', 'Input mengandung karakter berbahaya', 'error');
        return;
      }
      
      // Validasi username jika register
      if (!isLogin && sanitizedData.username) {
        if (!isValidUsername(sanitizedData.username)) {
          notify('Validasi Gagal', 'Username harus 3-20 karakter, alphanumeric saja', 'error');
          return;
        }
      }
      
      // Validasi email format
      if (!isValidEmail(sanitizedData.email)) {
        notify('Validasi Gagal', 'Format email tidak valid', 'error');
        return;
      }
      
      setLoading(true);
      
      try {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        // Kirim data yang sudah disanitasi
        const payload = isLogin 
          ? { 
              email: sanitizedData.email, 
              password: formData.password 
            }
          : { 
              username: sanitizedData.username, 
              email: sanitizedData.email, 
              password: formData.password,
              securityPin: sanitizedData.securityPin  
            };
        
        const res = await axios.post(`https://server-taptiptup.vercel.app${endpoint}`, payload);
        
        if (isLogin) {
          // Login success - SIMPAN TOKEN DENGAN AMAN
          localStorage.setItem('token', res.data.token);
          const today = new Date().toISOString().slice(0, 10); // "2025-06-11"
          localStorage.setItem('loginModalShownDate', today);
          // Simpan info user (tidak sensitive)
          if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(safeText(JSON.stringify({
              id: res.data.user.id,
              username: res.data.user.username,
              email: res.data.user.email // Email boleh disimpan
            }))));
          }
          
          notify('Login Berhasil!', 'Selamat datang kembali di dashboard!', 'success');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          // Register → Verify PIN
          setTempEmail(sanitizedData.email);
          notify('Registrasi Berhasil', 'Selamat datang streamer', 'success');
          setTimeout(() => {
            closeNotif();
            setIsLogin(true);           
            setFormData({ username:'', email:'', password:'' });
          }, 2500);
        }
      } catch (err) {
        // ERROR HANDLING - Jangan expose detail error ke user
        const errorMessage = err.response?.data?.message || 'Koneksi terputus atau server error';      
        notify('Gagal', errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    const isTabActive = (i) => (isLogin && i === 0) || (!isLogin && i === 1);

    // Render current page
    const renderPage = () => {
      switch (currentPage) {
        case 'reset-password':
          return <ResetPasswordPage 
            T={T} 
            notify={notify} 
            closeNotif={closeNotif} 
            navigate={navigate}
            emailProp={tempEmail}    // ← tambah ini
            tokenProp={tempToken}    // ← tambah ini
            setCurrentPage={setCurrentPage}   // ← tambah ini
            setIsLogin={setIsLogin}  
        />;
        
        case 'verify-pin':
          return <VerifyPinPage T={T} notify={notify} closeNotif={closeNotif} navigate={navigate} email={tempEmail} />;
        
        case 'forgot-password':
          return (
            <ForgotPasswordPage 
              T={T} 
              setCurrentPage={setCurrentPage} 
              emailReset={emailReset} 
              setEmailReset={setEmailReset}
              setTempEmail={setTempEmail}
              setTempToken={setTempToken}     // ← Tambahkan ini
              notify={notify}
            />
          );
        
        default:
          return (
            <MainAuthForm 
              T={T} 
              isDark={isDark}
              isLogin={isLogin} setIsLogin={setIsLogin}
              loading={loading} formData={formData} setFormData={setFormData}
              isTabActive={isTabActive} handleSubmit={handleSubmit}
              setCurrentPage={setCurrentPage}
            />
          );
      }
    };

    return (
      <>
        <SecurityModal show={showSecurityModal} onClose={() => setShowSecurityModal(false)} />

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
          .auth-input-field::placeholder { color: #94a3b8 !important; font-weight: 400; }
          .tab-btn { transition: all 0.22s cubic-bezier(.4,0,.2,1); }
          .tab-btn:active { transform: scale(0.99); }
          .submit-btn:active:not(:disabled) { transform: scale(0.99) !important; }
          .submit-btn:hover:not(:disabled) { filter: brightness(1.08); }

          * {
            -webkit-user-select: none;
            user-select: none;
          }

          /* Izinkan seleksi dan ketik di dalam input */
          input, textarea {
            -webkit-user-select: text;
            user-select: text;
          }

          .auth-input-field::placeholder {
            font-weight: 700;
            color: #9CA3AF !important;
            opacity: 0.3 !important; 
          }

          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .auth-root { flex-direction: column !important; }
            .auth-left { width: 100% !important; min-height: auto !important; padding: 0px 0px !important; }
          }
        `}</style>

        <div className="auth-root" style={{ 
          minHeight:'100vh', overflow:'hidden', background: T.pageBg, 
          display:'flex', flexDirection:'row', transition:'background 0.35s' 
        }}>
          <NotifModal notification={notification} onClose={closeNotif} />
          
          <LeftPanel />
          <RightPanel T={T} isDark={isDark} setIsDark={setIsDark}>
            <AnimatePresence mode="wait">
              {renderPage()}
            </AnimatePresence>
          </RightPanel>
        </div>
      </>
    );
  };

  export default Auth;