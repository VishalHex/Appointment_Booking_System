import { Link, useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import '../pages/Auth.css';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role === 'admin') {
      navigate('/admin/providers');
    } else if (user.role === 'provider') {
      navigate('/provider-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>
          <LoginForm onLogin={handleLoginSuccess} />
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
          </div>
        </div>
        <div className="auth-image">
          <div className="image-placeholder">🔐</div>
          <h3>Secure Access</h3>
          <p>Your account is protected with industry-standard security.</p>
        </div>
      </div>
    </div>
  );
}
