import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { UserIcon, ArrowRightOnRectangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'consultant':
        return '/consultant/dashboard';
      case 'member':
        return '/member/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getTicketsPath = () => {
    if (!user) return '/tickets';
    switch (user.role) {
      case 'admin':
        return '/admin/tickets';
      default:
        return '/tickets';
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-red-600">
            Teşvik360
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/incentives"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Teşvikler
                </Link>
                <Link
                  to="/applications"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Başvurularım
                </Link>
                <Link
                  to={getTicketsPath()}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                  Ticket Yönetimi
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <UserIcon className="w-4 h-4 mr-1" />
                  {user?.firstName} {user?.lastName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="relative text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center group overflow-hidden transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:shadow-lg transform hover:scale-105"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  
                  {/* Ripple effect */}
                  <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-red-200 rounded-full group-hover:w-full group-hover:h-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"></div>
                  </div>
                  
                  {/* Icon with rotation animation */}
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1 relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  
                  {/* Text with slide animation */}
                  <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1 font-medium">
                    Çıkış
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;