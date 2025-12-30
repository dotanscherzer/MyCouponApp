import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/groups', { replace: true });
  }, [navigate]);

  return <div>Redirecting to Groups...</div>;
};

