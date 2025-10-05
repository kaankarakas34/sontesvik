import React from 'react';
import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {}

const AuthLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teşvik360</h1>
          <p className="mt-2 text-sm text-gray-600">Teşvik ve Hibe Yönetim Sistemi</p>
        </div>
      </div>
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 sm:py-12 px-6 sm:px-8 lg:px-12 shadow-lg sm:rounded-lg overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;