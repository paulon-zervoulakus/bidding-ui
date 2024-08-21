import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UserContext } from '../../context/userContextProvider';

const PublicRoute: React.FC = () => {
    const context = useContext(UserContext);

    if (!context) {
        // Handle case where context is not available
        return <Navigate to="/login" />;
    }
    const { user } = context;

    return !user?.isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

export default PublicRoute;
