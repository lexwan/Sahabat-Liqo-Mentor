import { getAuthData } from "../utils/authHelper"; 

const useAuth = () => {
  const authData = getAuthData();
  
  return {
    role: authData?.user?.role || null,
    isAuthenticated: !!authData?.token,
    loading: false,
    authChecked: true
  };
};

export default useAuth;
