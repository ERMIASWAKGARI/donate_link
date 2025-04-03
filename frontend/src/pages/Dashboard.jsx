// Dashboard.js
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Header_for_indDonor from './Donor/IndividualDonor/Header_for_indDonor';
const Dashboard = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  // console.log(user);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  const handleform = () => {
    navigate('/donation-form');
  };

  return (
    <div>
      <Header_for_indDonor />
      <nav style={{ padding: '10px', backgroundColor: '#333', color: '#fff' }}>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0 }}>
          <li style={{ marginRight: '20px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'none', color: '#fff', border: 'none' }}
            >
              Dashboard
            </button>
          </li>
          <li style={{ marginRight: '20px' }}>
            <button
              onClick={handleLogout}
              style={{ background: 'none', color: '#fff', border: 'none' }}
            >
              Logout
            </button>
          </li>
          <li style={{ marginRight: '20px' }}>
            <button
              onClick={handleform}
              style={{ background: 'none', color: '#fff', border: 'none' }}
            >
              donation from
            </button>
          </li>
        </ul>
      </nav>

      {/* Dashboard Content */}
      <div style={{ padding: '20px' }}>
        <h1>Welcome, {user ? user.name : 'Guest'}</h1>
        <p>This is your dashboard.</p>
        <p>Is your information correct?</p>
        <p>
          <strong>Email:</strong> {user ? user.email : 'N/A'}
        </p>
        <p>
          <strong>Phone:</strong> {user ? user.phone : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
