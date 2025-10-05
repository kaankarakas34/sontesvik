import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect based on user role
  if (user && isAuthenticated) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'consultant':
        return <Navigate to="/consultant/dashboard" replace />;
      case 'member':
        return <Navigate to="/member/dashboard" replace />;
      default:
        // Eğer role tanımlı değilse member olarak yönlendir
        return <Navigate to="/member/dashboard" replace />;
    }
  }

  // Giriş yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Yükleniyor durumu
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
      </div>
    </div>
  );
};

export default DashboardPage;