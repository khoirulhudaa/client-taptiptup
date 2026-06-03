// import { useEffect, useState } from 'react';

// export const useServerStatus = () => {
//   const [isOnline, setIsOnline] = useState(true);
//   const [checking, setChecking] = useState(true);

//   const check = async () => {
//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
//         method: 'GET',
//         signal: AbortSignal.timeout(5000),
//       });
//       setIsOnline(res.ok);
//     } catch {
//       setIsOnline(false);
//     } finally {
//       setChecking(false);
//     }
//   };

//   useEffect(() => {
//     check();
//     const interval = setInterval(check, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   return { isOnline, checking, retry: check };
// };


import { useEffect, useRef, useState } from 'react';

export const useServerStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(true);
  const intervalRef = useRef(null);

  const scheduleNext = (online) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Online → cek tiap 5 menit, Offline → cek tiap 1 detik
    const delay = online ? 300000 : 30000;
    intervalRef.current = setTimeout(() => check(), delay);
  };

  const check = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setIsOnline(res.ok);
      scheduleNext(res.ok);
    } catch {
      setIsOnline(false);
      scheduleNext(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    check();
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  return { isOnline, checking, retry: check };
};