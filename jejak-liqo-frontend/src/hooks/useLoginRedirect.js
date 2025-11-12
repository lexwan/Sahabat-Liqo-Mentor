import { useNavigate } from 'react-router-dom';

const useLoginRedirect = () => {
  const navigate = useNavigate();

  const redirectByRole = (user) => {
    if (!user || !user.role) {
      navigate('/login');
      return;
    }

    const roleRoutes = {
      'super_admin': '/superadmin/dashboard',
      'admin': '/admin/dashboard',
      'mentor': '/mentor/dashboard'
    };

    const route = roleRoutes[user.role] || '/login';
    navigate(route);
  };

  return { redirectByRole };
};

export default useLoginRedirect;