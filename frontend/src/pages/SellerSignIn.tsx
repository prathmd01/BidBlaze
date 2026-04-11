
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const SellerSignIn = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/auth'); }, [navigate]);
  return null;
};
export default SellerSignIn;
