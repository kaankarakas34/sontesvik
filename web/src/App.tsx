import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { setCredentials, logout } from './store/slices/authSlice'
import { startAutoTokenRefresh, startTokenExpiryChecker } from './utils/tokenUtils'
import NewIncentiveApplicationPage from './pages/NewIncentiveApplicationPage';
import NewApplicationPage from './pages/NewApplicationPage';
import IncentiveGuidePage from './pages/IncentiveGuidePage';
import BrowseIncentivesPage from './pages/BrowseIncentivesPage';
import TicketListPage from './pages/admin/TicketListPage';
import CreateTicketPage from './pages/admin/CreateTicketPage';
import NotFoundPage from './pages/NotFoundPage'
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/NewTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminTicketsPage from './pages/AdminTicketsPage';

// Layout components
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import IncentivesPage from './pages/IncentivesPage'
import IncentiveDetailPage from './pages/IncentiveDetailPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetailPage from './pages/ApplicationDetailPage'
import ApplicationStartPage from './pages/ApplicationStartPage'
import ApplicationRoomPage from './pages/ApplicationRoomPage'
import ProfilePage from './pages/ProfilePage'
import UserApprovalManagement from './pages/UserApprovalManagement'
import SectorsManagement from './pages/admin/SectorsManagement'
import SectorsPage from './pages/admin/SectorsPage'
import IncentivesManagement from './pages/admin/IncentivesManagement'
import IncentiveTypesManagement from './pages/admin/IncentiveTypesManagement'
import AddIncentiveType from './pages/admin/AddIncentiveType'
import EditIncentiveType from './pages/admin/EditIncentiveType'
import DocumentTypesManagement from './pages/admin/DocumentTypesManagement'
import CreateDocumentType from './pages/admin/CreateDocumentType'
import EditDocumentType from './pages/admin/EditDocumentType'
import IncentiveDocumentsManagement from './pages/admin/IncentiveDocumentsManagement'
import DocumentArchiveManagement from './pages/admin/DocumentArchiveManagement'
import NotificationManagement from './pages/admin/NotificationManagement'
import IncentiveGuideEditor from './pages/admin/IncentiveGuideEditor'
import TicketManagement from './pages/admin/TicketManagement'
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboardPage from './pages/Admin/DashboardPage';
import IncentiveGuidesPage from './pages/admin/IncentiveGuidesPage';
import AddIncentiveGuide from './pages/admin/AddIncentiveGuide';
import EditIncentiveGuide from './pages/admin/EditIncentiveGuide';
import UsersPage from './pages/admin/UsersPage';
import AdminApplicationsPage from './pages/admin/ApplicationsPage';
import LogsPage from './pages/LogsPage';

// Test component
import TestConnection from './components/TestConnection';

// User pages
import Applications from './pages/user/Applications';
import Support from './pages/user/Support';
import Documents from './pages/user/Documents';
import MemberDashboard from './pages/MemberDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import NotificationPage from './pages/NotificationPage';

// Admin pages
import SectorSettings from './pages/admin/SectorSettings';
import IncentiveSettings from './pages/admin/IncentiveSettings';
import DocumentManagement from './pages/admin/DocumentManagement';
import DocumentIncentiveManagement from './pages/admin/DocumentIncentiveManagement';
import NotificationCenter from './pages/admin/NotificationCenter';

// Types
import type { RootState } from './store'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    // Token süresi kontrolünü başlat
    const stopTokenChecker = startTokenExpiryChecker(
      () => {
        // Token süresi doldu
        console.log('Oturum süreniz doldu, lütfen tekrar giriş yapın');
        dispatch(logout());
      },
      () => {
        // Token süresi dolmak üzere
        console.log('Oturum süreniz yakında dolacak');
      }
    );

    // Otomatik token yenilemeyi başlat
    const stopAutoRefresh = startAutoTokenRefresh(
      (newToken) => {
        // Token başarıyla yenilendi
        dispatch(setCredentials({
          user: user,
          token: newToken,
          refreshToken: localStorage.getItem('refreshToken')
        }));
      },
      () => {
        // Token yenileme başarısız
        dispatch(logout());
      }
    );

    return () => {
      stopTokenChecker();
      stopAutoRefresh();
    };
  }, [dispatch]); // user dependency'sini kaldırdım

  return (
    <>
      <Helmet>
        <title>Teşvik360 - Teşvik ve Hibe Platformu</title>
        <meta name="description" content="Türkiye'nin en kapsamlı teşvik ve hibe platformu" />
      </Helmet>
      
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />
        </Route>
        
        <Route
          path="/admin"
          element={<AdminRoute><AdminLayout /></AdminRoute>}
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="guides" element={<IncentiveGuidesPage />} />
          <Route path="guides/add" element={<AddIncentiveGuide />} />
          <Route path="guides/edit/:id" element={<EditIncentiveGuide />} />
          <Route path="user-approval" element={<UserApprovalManagement />} />
          <Route path="sectors" element={<SectorsPage />} />
          <Route path="incentives" element={<IncentivesManagement />} />
          <Route path="incentive-types" element={<IncentiveTypesManagement />} />
          <Route path="incentive-types/add" element={<AddIncentiveType />} />
          <Route path="incentive-types/edit/:id" element={<EditIncentiveType />} />
          <Route path="document-types" element={<DocumentTypesManagement />} />
          <Route path="document-types/create" element={<CreateDocumentType />} />
          <Route path="document-types/edit/:id" element={<EditDocumentType />} />
          <Route path="incentive-documents" element={<IncentiveDocumentsManagement />} />
          <Route path="document-archive" element={<DocumentArchiveManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
          <Route path="incentive-guide/:incentiveId" element={<IncentiveGuideEditor />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="sector-settings" element={<SectorSettings />} />
          <Route path="incentive-settings" element={<IncentiveSettings />} />
          <Route path="document-management" element={<DocumentManagement />} />
          <Route path="document-incentive-management" element={<DocumentIncentiveManagement />} />
          <Route path="notification-center" element={<NotificationCenter />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
        
        {/* Test route */}
        <Route path="/test-connection" element={<TestConnection />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="member/dashboard" element={<MemberDashboard />} />
          <Route path="consultant/dashboard" element={<ConsultantDashboard />} />
          <Route path="user-dashboard" element={<MemberDashboard />} />
          <Route path="incentives" element={<IncentivesPage />} />
          <Route path="browse-incentives" element={<BrowseIncentivesPage />} />
          <Route path="new-incentive-application" element={<NewIncentiveApplicationPage />} />
          <Route path="applications/new/:incentiveId" element={<NewApplicationPage />} />
          <Route path="/incentive-guide/:id" element={<IncentiveGuidePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:applicationId/room" element={<ApplicationRoomPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="support" element={<Support />} />
          <Route path="documents" element={<Documents />} />
           <Route path="tickets" element={<TicketsPage />} />
           <Route path="tickets/new" element={<NewTicketPage />} />
           <Route path="tickets/:id" element={<TicketDetailPage />} />
         </Route>
 
         {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App