import React from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug' | 'http';
  message: string;
  stack?: string;
  service?: string;
  file: string;
  [key: string]: any;
}

interface LogListProps {
  logs: LogEntry[];
  loading?: boolean;
  onRefresh?: () => void;
}

const LogList: React.FC<LogListProps> = ({ logs, loading = false, onRefresh }) => {
  const [expandedLogs, setExpandedLogs] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warn':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'debug':
        return <CheckCircleIcon className="w-5 h-5 text-gray-500" />;
      case 'http':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'debug':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'http':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getBorderColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'border-l-red-500';
      case 'warn':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      case 'debug':
        return 'border-l-gray-500';
      case 'http':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now.getTime() - logTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return formatTimestamp(timestamp);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-medium text-red-800">Log Kayıtları</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loglar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg border border-red-200">
        <div className="px-6 py-4 border-b border-red-200">
          <h3 className="text-lg font-medium text-red-800">Log Kayıtları</h3>
        </div>
        <div className="p-8 text-center text-gray-500">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Log kaydı bulunamadı</p>
          <p className="text-sm">Bu kriterlere uygun log kaydı bulunmuyor.</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Yenile
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg border border-red-200">
      <div className="px-6 py-4 border-b border-red-200">
        <h3 className="text-lg font-medium text-red-800">
          Log Kayıtları ({logs.length} kayıt)
        </h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {logs.map((log, index) => {
          const isExpanded = expandedLogs.has(log.id);
          const hasDetails = log.stack || Object.keys(log).some(key => 
            !['id', 'timestamp', 'level', 'message', 'service', 'file'].includes(key)
          );

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`hover:bg-gray-50 transition-colors duration-200 border-l-4 ${getBorderColor(log.level)}`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        {log.service && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {log.service}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500 flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          <span title={formatTimestamp(log.timestamp)}>
                            {formatRelativeTime(log.timestamp)}
                          </span>
                        </div>
                        {hasDetails && (
                          <button
                            onClick={() => toggleExpanded(log.id)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {isExpanded ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-1 break-words">{log.message}</p>
                    
                    <div className="text-xs text-gray-500">
                      Dosya: {log.file}
                    </div>

                    {isExpanded && hasDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200"
                      >
                        {log.stack && (
                          <div className="mb-3">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Stack Trace:</h4>
                            <pre className="p-2 bg-gray-100 rounded text-xs text-gray-800 overflow-x-auto max-h-32 overflow-y-auto">
                              {log.stack}
                            </pre>
                          </div>
                        )}
                        
                        {/* Additional log data */}
                        {Object.entries(log)
                          .filter(([key]) => !['id', 'timestamp', 'level', 'message', 'service', 'file', 'stack'].includes(key))
                          .map(([key, value]) => (
                            <div key={key} className="mb-2">
                              <span className="text-xs font-medium text-gray-700">{key}:</span>
                              <span className="text-xs text-gray-600 ml-2">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </span>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LogList;