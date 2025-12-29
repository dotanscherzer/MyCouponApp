import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{ padding: '20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
          Coupon Manager
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/groups">Groups</Link>
            {user?.appRole === 'super_admin' && (
              <Link to="/admin">Admin</Link>
            )}
            <Link to="/settings">Settings</Link>
            <span>{user?.displayName}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};
