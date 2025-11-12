import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const roleRoutes = {
          'super_admin': '/superadmin/dashboard',
          'admin': '/admin/dashboard', 
          'mentor': '/mentor/dashboard'
        };
        
        const route = roleRoutes[user.role];
        if (route) {
          navigate(route, { replace: true });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [navigate]);

  return null;
};

export default LoginRedirect;