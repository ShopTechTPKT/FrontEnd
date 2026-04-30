import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import notify from '../../utils/notify';

// OAuth2 callback — uses raw axios with full URL to avoid interceptor redirect loops
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/auth/me`, { withCredentials: true })
      .then((res) => {
        const data = res?.data || {};
        const user = {
          fullName: data.name || '',
          email: data.email || '',
          avatar: data.picture || '',
          oidcClaims: data.claims || {},
          loginProvider: 'google',
          role: 'customer',
        };
        try {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('authToken', 'google');
        } catch {}
        notify.success('Đăng nhập Google thành công');
        window.location.replace('/');
      })
      .catch(() => navigate('/login'));
  }, []);

  return null;
}
