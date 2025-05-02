import { useEffect, useState } from 'react';
import { getAllDonations } from '../api/adminApi';

const useDashboardDonations = (fetchAll = false) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      // Pass null as limit when fetchAll is true
      const response = await getAllDonations(
        1,
        '-createdAt',
        fetchAll ? null : 10
      );
      console.log('donations response: ', response);
      setDonations(response.donations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [fetchAll]);

  return {
    donations,
    loading,
    error,
    refetch: fetchDonations,
  };
};

export default useDashboardDonations;
