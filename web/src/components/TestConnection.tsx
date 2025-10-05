import React, { useState } from 'react';
import { api } from '../services/api';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<any>(null);

  const testConnection = async () => {
    setStatus('loading');
    setMessage('');
    setResponse(null);

    try {
      // Test health endpoint
      const healthResponse = await api.get('/health');
      console.log('Health response:', healthResponse.data);

      // Test API endpoint
      const apiResponse = await api.get('/api/test');
      console.log('API response:', apiResponse.data);

      setStatus('success');
      setMessage('Backend bağlantısı başarılı!');
      setResponse({
        health: healthResponse.data,
        api: apiResponse.data
      });
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || error.message || 'Bağlantı hatası');
      setResponse(error.response?.data || error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Backend Bağlantı Testi</h2>
      
      <button
        onClick={testConnection}
        disabled={status === 'loading'}
        className={`w-full px-4 py-2 rounded-md font-medium ${
          status === 'loading'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {status === 'loading' ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
      </button>

      {message && (
        <div
          className={`p-3 rounded-md ${
            status === 'success'
              ? 'bg-green-100 text-green-800'
              : status === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {message}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Response:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestConnection;