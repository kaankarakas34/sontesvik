import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  HomeIcon,
  ChevronRightIcon,
  TagIcon,
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="w-72 bg-gradient-to-br from-red-50 via-white to-red-50 border-r border-red-100 flex flex-col shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="p-6 border-b border-red-100 bg-gradient-to-r from-red-600 to-red-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheckIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Panel</h2>
            <p className="text-red-100 text-sm font-medium">Yönetim Sistemi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 px-2">
            Ana Menü
          </h3>
        </div>
        
        <NavLink
          to="/admin/document-incentive-management"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <FolderIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Belge Yönetimi</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <HomeIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Anasayfa</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/guides"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Teşvik Kılavuzları</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <UsersIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Kullanıcılar</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/sectors"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <BuildingOfficeIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Sektör Yönetimi</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/incentives"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <TagIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Teşvik Yönetimi</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/tickets"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Ticket Yönetimi</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/applications"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <ShieldCheckIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Başvurular</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>

        <NavLink
          to="/admin/logs"
          className={({ isActive }) =>
            `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] ${
              isActive 
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 border-l-4 border-red-800' 
                : 'text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-800 hover:shadow-md'
            }`
          }
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
              ({ isActive }: { isActive: boolean }) => isActive 
                ? 'bg-white/20' 
                : 'bg-red-100 group-hover:bg-red-200'
            }`}>
              <ClipboardDocumentListIcon className="h-5 w-5" />
            </div>
            <span className="font-medium">Sistem Logları</span>
          </div>
          <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-red-100 bg-gradient-to-r from-red-50 to-white space-y-4">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-sm border border-red-100">
          <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Admin</p>
            <p className="text-xs text-red-500">Sistem Yöneticisi</p>
          </div>
        </div>
        
        {/* Modern Animated Logout Button */}
        <button
          onClick={handleLogout}
          className="group relative w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 active:scale-95 border border-red-700 overflow-hidden"
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Ripple effect on click */}
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-active:opacity-20 group-active:animate-ping"></div>
          
          {/* Icon with enhanced animations */}
          <ArrowRightOnRectangleIcon className="relative h-5 w-5 mr-2 group-hover:rotate-12 group-hover:scale-125 transition-all duration-300 group-hover:animate-pulse" />
          
          {/* Text with slide and glow effect */}
          <span className="relative transform group-hover:translate-x-1 transition-all duration-300 group-hover:drop-shadow-lg">
            Çıkış Yap
          </span>
          
          {/* Shine effect sweep */}
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {/* Glow border effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;