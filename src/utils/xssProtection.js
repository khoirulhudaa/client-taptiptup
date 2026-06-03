// utils/xssProtection.js

/**
 * XSS Protection Utilities
 * Mencegah serangan Cross-Site Scripting
 */

// Karakter berbahaya yang harus di-escape
const DANGEROUS_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
  '=': '&#x3D;'
};

// Pattern untuk mendeteksi tagscript/tag berbahaya
const XSS_PATTERN = /<script[^>]*>.*?<\/script>|<iframe[^>]*>.*?<\/iframe>|javascript:|on\w+\s*=|data:\s*text\/html/gi;

/**
 * Escape HTML special characters
 * @param {string} str - String yang akan di-escape
 * @returns {string} - String yang sudah di-escape
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') {
    return String(str || '');
  }
  
  return str.replace(/[&<>"'`\/=]/g, (char) => {
    return DANGEROUS_CHARS[char] || char;
  });
};

/**
 * Sanitasi input dari tag/attributes berbahaya
 * @param {string} input - Input yang akan disanitasi
 * @returns {string} - Input yang sudah aman
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  let sanitized = String(input);
  
  // Hapus tag script
  sanitized = sanitized.replace(/<\/?script[^>]*>/gi, '');
  
  // Hapus iframe
  sanitized = sanitized.replace(/<\/?iframe[^>]*>/gi, '');
  
  // Hapus event handlers (onclick, onerror, etc)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*['"][^'"]*['"]/gi, '');
  
  // Hapus javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Hapus data: URL
  sanitized = sanitized.replace(/data:\s*text\/html/gi, '');
  
  // Hapus <style Tag
  sanitized = sanitized.replace(/<\/?style[^>]*>/gi, '');
  
  // Hapus expression() (IE)
  sanitized = sanitized.replace(/expression\s*\$/gi, '');
  
  return sanitized.trim();
};

/**
 * Validasi apakah input mengandung XSS
 * @param {string} input - Input yang akan dicek
 * @returns {boolean} - True jika aman, False jika ada dangerous content
 */
export const detectXSS = (input) => {
  if (!input) return false;
  
  const str = String(input);
  
  // Cek pattern berbahaya
  if (XSS_PATTERN.test(str)) {
    return true;
  }
  
  // Cek encoded patterns
  const encodedPatterns = [
    /&lt;script/i,
    /&gt;script/i,
    /&#x27;/i,
    /&#96;/i,
    /eval\s*\$/i,
    /innerHTML\s*=/i,
    /outerHTML\s*=/i
  ];
  
  return encodedPatterns.some(pattern => pattern.test(str));
};

/**
 * Buat elemen React yang aman (menggunakan text instead of HTML)
 * @param {string} text - Text yang akan ditampilkan
 * @returns {string} - Text yang sudah di-sanitize
 */
export const safeText = (text) => {
  if (!text) return '';
  return sanitizeInput(text);
};

/**
 * Validasi URL apakah aman
 * @param {string} url - URL yang akan dicek
 * @returns {boolean} - True jika aman
 */
export const isSafeUrl = (url) => {
  if (!url) return false;
  
  const validProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const invalidProtocols = ['javascript:', 'data:', 'vbscript:'];
  
  const lowerUrl = url.toLowerCase().trim();
  
  // Cek invalid protocols
  if (invalidProtocols.some(proto => lowerUrl.startsWith(proto))) {
    return false;
  }
  
  // Cek valid protocols
  return validProtocols.some(proto => lowerUrl.startsWith(proto));
};

/**
 * Validasi email apakah valid format
 * @param {string} email - Email yang akan dicek
 * @returns {boolean} - True jika valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validasi username
 * @param {string} username - Username yang akan dicek
 * @returns {boolean} - True jika valid (alphanumeric, underscore, dash, 3-20 chars)
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validasi password strength
 * @param {string} password - Password yang akan dicek
 * @returns {object} - Object dengan isValid dan strength level
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 0,
    message: ''
  };
  
  if (!password || password.length < 6) {
    result.message = 'Password minimal 6 karakter';
    return result;
  }
  
  let strength = 0;
  
  // Check length
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Check uppercase
  if (/[A-Z]/.test(password)) strength += 1;
  
  // Check lowercase
  if (/[a-z]/.test(password)) strength += 1;
  
  // Check numbers
  if (/[0-9]/.test(password)) strength += 1;
  
  // Check special chars
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  result.strength = strength;
  result.isValid = password.length >= 6;
  
  if (strength < 2) {
    result.message = 'Password lemah';
  } else if (strength < 4) {
    result.message = 'Password sedang';
  } else {
    result.message = 'Password kuat';
  }
  
  return result;
};