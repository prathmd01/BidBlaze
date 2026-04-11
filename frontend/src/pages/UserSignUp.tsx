
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const UserSignUp = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/auth'); }, [navigate]);
  return null;
};
export default UserSignUp;
