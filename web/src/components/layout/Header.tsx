import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { 
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import NotificationDropdown from '../shared/NotificationDropdown';

const Header: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-lg bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold text-red-600 hover:text-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Teşvik360
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationDropdown />
            
            {/* Tickets Link */}
            <Link
              to={getTicketsPath()}
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md"
              title="Ticket Yönetimi"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              <span className="hidden sm:inline">Ticket Yönetimi</span>
            </Link>
            
            {/* Profile Button */}
            <Link
              to="/profile"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md"
              title="Profil"
            >
              <UserIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
              </div>
            </Link>
            
            {/* Modern Animated Logout Button */}
            <button
              onClick={handleLogout}
              className="group relative flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 active:scale-95 overflow-hidden"
              title="Çıkış Yap"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
              
              {/* Icon with rotation animation */}
              <ArrowRightOnRectangleIcon className="relative w-5 h-5 mr-2 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              
              {/* Text with slide effect */}
              <span className="relative hidden sm:inline transform group-hover:translate-x-1 transition-transform duration-300">
                Çıkış Yap
              </span>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;