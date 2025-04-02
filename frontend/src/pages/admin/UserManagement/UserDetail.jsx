import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  banUser,
  deleteUser,
  getUserById,
  rejectUser,
  unbanUser,
  verifyUser,
} from '../../api/adminApi';
import StatusBadge from '../common/StatusBadge';
import VerificationPanel from './VerificationPanel';

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserById(id);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleVerify = async () => {
    try {
      await verifyUser(id);
      setUser((prev) => ({ ...prev, isVerified: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async () => {
    try {
      await rejectUser(id, rejectionReason);
      setUser((prev) => ({ ...prev, isVerified: false }));
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBan = async () => {
    try {
      await banUser(id);
      setUser((prev) => ({ ...prev, isBanned: true }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser(id);
      setUser((prev) => ({ ...prev, isBanned: false }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      // Redirect to user list or show success message
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading user details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <StatusBadge isBanned={user.isBanned} isVerified={user.isVerified} />
        </div>
        <div className="flex space-x-2">
          {user.isBanned ? (
            <button
              onClick={handleUnban}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Unban User
            </button>
          ) : (
            <button
              onClick={handleBan}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Ban User
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Delete User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Basic Information</h3>
          <p>
            <span className="font-medium">ID:</span> {user._id}
          </p>
          <p>
            <span className="font-medium">Joined:</span>{' '}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Account Status</h3>
          <p>
            <span className="font-medium">Verified:</span>{' '}
            {user.isVerified ? 'Yes' : 'No'}
          </p>
          <p>
            <span className="font-medium">Banned:</span>{' '}
            {user.isBanned ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      {!user.isVerified && (
        <VerificationPanel
          onVerify={handleVerify}
          onReject={handleReject}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
        />
      )}
    </div>
  );
};

export default UserDetail;
