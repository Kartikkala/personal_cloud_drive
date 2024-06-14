import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth_token = localStorage.getItem('token');
        if (!auth_token) {
            setIsAuthenticated(false);
            navigate('/signin');
        } else {
            setIsAuthenticated(true);
        }
    }, []);

    return isAuthenticated;
};

export default useAuth;