import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        token,
        newPassword: password
      });

      alert("Password berhasil direset");
      navigate('/login');
    } catch {
      alert("Gagal reset password");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <input 
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default ResetPassword;