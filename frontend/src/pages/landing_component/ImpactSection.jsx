import { useState, useEffect } from 'react';
import {
  FaUserFriends,
  FaHandHoldingHeart,
  FaHandsHelping,
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from 'axios';
import { Spin } from 'antd';

const ImpactSection = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: {},
    totalNgos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchImpactStats();
  }, []);

  const fetchImpactStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/impact/get-impact'
      );
      console.log(response.data.data);
      setStats(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch impact statistics');
      console.error('Error fetching impact stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: currency === 'ETB' ? 2 : 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <Spin size="large" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Our Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Number of Donors */}
          <div className="flex flex-col items-center" data-aos="fade-up">
            <FaUserFriends className="text-[#008080] text-5xl mb-4" />
            <h3 className="text-4xl font-bold text-gray-800">
              {stats.totalDonors.toLocaleString()}+
            </h3>
            <p className="text-gray-600">Donors Helped</p>
          </div>

          {/* Total Donations Received */}
          <div
            className="flex flex-col items-center"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <FaHandHoldingHeart className="text-[#008080] text-5xl mb-4" />
            <div className="flex flex-col items-center">
              {stats.totalDonations.ETB && (
                <h3 className="text-4xl font-bold text-gray-800">
                  {formatCurrency(stats.totalDonations.ETB, 'ETB')}+
                </h3>
              )}
              {stats.totalDonations.USD && (
                <h3 className="text-4xl font-bold text-gray-800 mt-2">
                  {formatCurrency(stats.totalDonations.USD, 'USD')}+
                </h3>
              )}
            </div>
            <p className="text-gray-600">Donations Received</p>
          </div>

          {/* Number of NGOs Supported */}
          <div
            className="flex flex-col items-center"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <FaHandsHelping className="text-[#008080] text-5xl mb-4" />
            <h3 className="text-4xl font-bold text-gray-800">
              {stats.totalNgos.toLocaleString()}+
            </h3>
            <p className="text-gray-600">NGOs Supported</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
