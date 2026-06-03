// src/hooks/useMaintenance.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const useMaintenance = () => {
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/maintenance/public`)
      .then(res => setMaintenance(res.data))
      .catch(() => setMaintenance(null))
      .finally(() => setLoading(false));
  }, []);

  return { maintenance, loading };
};