import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableAction {
  icon: React.ComponentType<any>;
  label: string;
  onClick: (row: any) => void;
  color?: string;
}

interface AnimatedTableProps {
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const AnimatedTable: React.FC<AnimatedTableProps> = ({
  columns,
  data,
  actions = [],
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'Veri bulunamadı',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Filter data based on search term
  const filteredData = data.filter(row =>
    columns.some(column =>
      String(row[column.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const actionButtonVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-500 font-medium">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ${className}`}
    >
      {/* Header with Search */}
      {searchable && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
            <input
              type="text"
              placeholder="Tabloda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-gradient-to-r from-red-600 to-red-700">
            <tr>
              {columns.map((column, index) => (
                <motion.th
                  key={column.key}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider ${
                    column.sortable && sortable ? 'cursor-pointer hover:bg-red-800 transition-colors' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortable && (
                      <motion.div
                        animate={{
                          rotate: sortColumn === column.key && sortDirection === 'desc' ? 180 : 0
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortColumn === column.key ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronUpIcon className="w-4 h-4 opacity-50" />
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.th>
              ))}
              {actions.length > 0 && (
                <motion.th
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + columns.length * 0.05 }}
                  className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider"
                >
                  İşlemler
                </motion.th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-100"
          >
            <AnimatePresence mode="wait">
              {paginatedData.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    variants={rowVariants}
                    whileHover={{
                      backgroundColor: '#fef2f2',
                      scale: 1.01,
                      transition: { duration: 0.2 }
                    }}
                    onHoverStart={() => setHoveredRow(rowIndex)}
                    onHoverEnd={() => setHoveredRow(null)}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    {columns.map((column, colIndex) => (
                      <motion.td
                        key={column.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rowIndex * 0.05 + colIndex * 0.02 }}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </motion.td>
                    ))}
                    {actions.length > 0 && (
                      <motion.td
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: rowIndex * 0.05 + columns.length * 0.02 }}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        <div className="flex justify-center gap-2">
                          {actions.map((action, actionIndex) => (
                            <motion.button
                              key={actionIndex}
                              variants={actionButtonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => action.onClick(row)}
                              className={`p-2 rounded-lg transition-all duration-200 ${
                                action.color || 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              }`}
                              title={action.label}
                            >
                              <action.icon className="w-4 h-4" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between"
        >
          <div className="text-sm text-gray-600">
            Toplam {sortedData.length} kayıt, sayfa {currentPage} / {totalPages}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Önceki
            </motion.button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </motion.button>
              );
            })}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Sonraki
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedTable;