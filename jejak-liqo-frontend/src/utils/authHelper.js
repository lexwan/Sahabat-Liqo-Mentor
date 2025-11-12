export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    try {
      const parsedUser = JSON.parse(user);
      return {
        token,
        user: parsedUser,
        role: parsedUser.role
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      clearAuthData();
      return null;
    }
  }
  return null;
};

export const clearAuthData = () => {
  // Only remove auth-related items
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('showLoginSuccessToast');
};

export const isAuthenticated = () => {
  return !!getAuthData();
};
