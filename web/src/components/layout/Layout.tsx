import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

interface LayoutProps {}

const Layout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;