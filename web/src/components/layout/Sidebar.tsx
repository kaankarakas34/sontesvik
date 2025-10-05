import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { 
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  BuildingOfficeIcon,
  TagIcon,
  FolderIcon,
  LinkIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Admin Menu Items
  const adminMenuItems = [
    {
      name: 'Ana Sayfa',
      path: '/admin/dashboard',
      icon: HomeIcon
    },
    {
      name: 'Kullanıcı Onayları',
      path: '/admin/user-approval',
      icon: UsersIcon
    },
    {
      name: 'Sektör Ayarları',
      path: '/admin/sectors',
      icon: BuildingOfficeIcon
    },
    {
      name: 'Teşvik Ayarları',
      path: '/admin/incentives',
      icon: TagIcon
    },
    {
      name: 'Belgeler',
      path: '/admin/documents',
      icon: FolderIcon
    },
    {
      name: 'Bildirimler',
      path: '/admin/notifications',
      icon: BellIcon
    },
    {
      name: 'Ticket Yönetimi',
      path: '/admin/tickets',
      icon: ChatBubbleLeftRightIcon
    }
  ];

  // Member/Company Menu Items
  const memberMenuItems = [
    {
      name: 'Dashboard',
      path: '/user-dashboard',
      icon: HomeIcon
    },
    {
      name: 'Başvurular',
      path: '/applications',
      icon: DocumentTextIcon
    },
    {
      name: 'Bildirimler',
      path: '/notifications',
      icon: BellIcon
    },
    {
      name: 'Biletler',
      path: '/tickets',
      icon: ChatBubbleLeftRightIcon
    },
    {
      name: 'Belgeler',
      path: '/documents',
      icon: FolderIcon
    }
  ];

  // Consultant Menu Items
  const consultantMenuItems = [
    {
      name: 'Dashboard',
      path: '/consultant/dashboard',
      icon: HomeIcon
    },
    {
      name: 'Müşterilerim',
      path: '/consultant/clients',
      icon: UsersIcon
    },
    {
      name: 'Başvurular',
      path: '/consultant/applications',
      icon: DocumentTextIcon
    },
    {
      name: 'Bildirimler',
      path: '/notifications',
      icon: BellIcon
    },
    {
      name: 'Biletler',
      path: '/tickets',
      icon: ChatBubbleLeftRightIcon
    },
    {
      name: 'Raporlar',
      path: '/consultant/reports',
      icon: ChartBarIcon
    }
  ];

  // Get menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];
    
    switch (user?.role) {
      case 'admin':
        return adminMenuItems;
      case 'consultant':
        return consultantMenuItems;
      case 'company':
      case 'member':
        return memberMenuItems;
      default:
        console.log('getMenuItems - Default case, returning empty array');
        return [];
    }
  };

  const menuItems = getMenuItems();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-red-600 to-red-700 shadow-xl h-screen w-64 fixed left-0 top-0 z-10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-red-500 flex-shrink-0">
        <Link to="/" className="text-2xl font-bold text-white">
          Teşvik360
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-white text-red-600 shadow-lg border-l-4 border-red-800'
                    : 'text-red-100 hover:bg-red-500 hover:text-white hover:shadow-md'
                }`}
                title={item.name}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="flex-shrink-0 p-4 border-t border-red-500">
        <div className="space-y-2">
          <Link
            to="/profile"
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive('/profile')
                ? 'bg-white text-red-600 shadow-lg'
                : 'text-red-100 hover:bg-red-500 hover:text-white hover:shadow-md'
            }`}
            title="Profil"
          >
            <UserIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
              <span className={`text-xs capitalize truncate ${isActive('/profile') ? 'text-red-400' : 'text-red-200'}`}>{user?.role}</span>
            </div>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-100 hover:bg-red-500 hover:text-white hover:shadow-md rounded-lg transition-all duration-200 group relative overflow-hidden transform hover:scale-105"
            title="Çıkış Yap"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/20 rounded-full group-hover:w-full group-hover:h-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"></div>
            </div>
            
            {/* Icon with rotation animation */}
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            
            {/* Text with slide animation */}
            <span className="truncate relative z-10 transition-all duration-300 group-hover:translate-x-1 font-medium">
              Çıkış Yap
            </span>
            
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;