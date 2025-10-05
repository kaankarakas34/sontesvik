import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">404 - Sayfa Bulunamadı</h1>
          <p className="mt-2 text-sm text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;