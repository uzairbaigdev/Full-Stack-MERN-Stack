import { useNavigate } from 'react-router-dom'; 
import useAuthStore from '../../zustand/authStore.js';

const Dashboard = () => { // Note: Capitalized component name (Best Practice)
  const navigate = useNavigate(); 
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; Path=/; SameSite=Lax';
    clearUser();
    navigate("/login"); 
  };

  return (
    <> 
      <button onClick={handleLogout}>Logout</button> 
    </>
  );
};

export default Dashboard;
