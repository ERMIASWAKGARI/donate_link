// AuthInitializer.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from './redux/userSlice';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchUserDetails(accessToken));
    }
  }, [accessToken, dispatch]);

  return children;
};

export default AuthInitializer;
