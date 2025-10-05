import React, { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, DocumentIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { logger } from '../../utils/logger';

interface Application {
  id: string;
  incentiveTitle: string;
  sectorName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_documents';
  submittedAt?: string;
  reviewedAt?: string;
  reviewerName?: string;
  reviewNotes?: string;
  requiredDocuments: RequiredDocument[];
  submittedDocuments: SubmittedDocument[];
  completionPercentage: number;
  estimatedProcessingTime: string;
  createdAt: string;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  fileTypes: string[];
  maxSize: number;
  isSubmitted: boolean;
}

interface SubmittedDocument {
  id: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // TODO: API call to fetch user applications
      // Mock data for now
      setApplications([
        {
          id: '1',
          incentiveTitle: 'Ar-Ge Teşviki',
          sectorName: 'Teknoloji',
          status: 'under_review',
          submittedAt: '2024-01-15T10:30:00Z',
          requiredDocuments: [
            {
              id: '1',
              name: 'Faaliyet Raporu',
              description: 'Şirketin yıllık faaliyet raporu',
              isRequired: true,
              fileTypes: ['pdf', 'doc', 'docx'],
              maxSize: 10,
              isSubmitted: true
            },
            {
              id: '2',
              name: 'Mali Tablolar',
              description: 'Son 3 yılın mali tabloları',
              isRequired: true,
              fileTypes: ['pdf', 'xls', 'xlsx'],
              maxSize: 5,
              isSubmitted: true
            },
            {
              id: '3',
              name: 'Proje Dosyası',
              description: 'Ar-Ge projesi detay dosyası',
              isRequired: true,
              fileTypes: ['pdf', 'doc', 'docx'],
              maxSize: 15,
              isSubmitted: false
            }
          ],
          submittedDocuments: [
            {
              id: '1',
              documentId: '1',
              fileName: 'faaliyet_raporu_2023.pdf',
              fileSize: 2.5,
              uploadedAt: '2024-01-15T09:00:00Z',
              status: 'approved'
            },
            {
              id: '2',
              documentId: '2',
              fileName: 'mali_tablolar.xlsx',
              fileSize: 1.8,
              uploadedAt: '2024-01-15T09:30:00Z',
              status: 'pending'
            }
          ],
          completionPercentage: 67,
          estimatedProcessingTime: '15-20 iş günü',
          createdAt: '2024-01-10T14:00:00Z'
        },
        {
          id: '2',
          incentiveTitle: 'İhracat Teşviki',
          sectorName: 'İmalat',
          status: 'approved',
          submittedAt: '2024-01-05T11:00:00Z',
          reviewedAt: '2024-01-12T16:30:00Z',
          reviewerName: 'Dr. Ahmet Yılmaz',
          reviewNotes: 'Tüm belgeler uygun bulunmuştur. Teşvik onaylanmıştır.',
          requiredDocuments: [
            {
              id: '1',
              name: 'İhracat Belgeleri',
              description: 'Son 12 ayın ihracat belgeleri',
              isRequired: true,
              fileTypes: ['pdf'],
              maxSize: 10,
              isSubmitted: true
            }
          ],
          submittedDocuments: [
            {
              id: '3',
              documentId: '1',
              fileName: 'ihracat_belgeleri_2023.pdf',
              fileSize: 3.2,
              uploadedAt: '2024-01-05T10:30:00Z',
              status: 'approved'
            }
          ],
          completionPercentage: 100,
          estimatedProcessingTime: '10-15 iş günü',
          createdAt: '2024-01-03T09:00:00Z'
        },
        {
          id: '3',
          incentiveTitle: 'Dijital Dönüşüm Teşviki',
          sectorName: 'Teknoloji',
          status: 'draft',
          requiredDocuments: [
            {
              id: '1',
              name: 'Dijital Dönüşüm Planı',
              description: 'Şirketin dijital dönüşüm stratejisi',
              isRequired: true,
              fileTypes: ['pdf', 'doc', 'docx'],
              maxSize: 10,
              isSubmitted: false
            }
          ],
          submittedDocuments: [],
          completionPercentage: 0,
          estimatedProcessingTime: '20-25 iş günü',
          createdAt: '2024-01-18T15:00:00Z'
        }
      ]);
    } catch (error) {
      logger.apiError('/api/applications', error, 'Applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'requires_documents':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Taslak';
      case 'submitted':
        return 'Gönderildi';
      case 'under_review':
        return 'İnceleniyor';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'requires_documents':
        return 'Belge Gerekli';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Başvurularım</h1>
        <button
          onClick={() => {/* TODO: Navigate to new application */}}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Başvuru
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'Tümü', count: applications.length },
              { key: 'draft', label: 'Taslak', count: applications.filter(a => a.status === 'draft').length },
              { key: 'submitted', label: 'Gönderildi', count: applications.filter(a => a.status === 'submitted').length },
              { key: 'under_review', label: 'İnceleniyor', count: applications.filter(a => a.status === 'under_review').length },
              { key: 'approved', label: 'Onaylanan', count: applications.filter(a => a.status === 'approved').length },
              { key: 'rejected', label: 'Reddedilen', count: applications.filter(a => a.status === 'rejected').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((application) => (
          <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(application.status)}
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {application.incentiveTitle}
                </h3>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {getStatusText(application.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sektör:</span>
                <span className="font-medium">{application.sectorName}</span>
              </div>
              
              {application.submittedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Başvuru Tarihi:</span>
                  <span className="font-medium">
                    {new Date(application.submittedAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tamamlanma:</span>
                <span className="font-medium">{application.completionPercentage}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${application.completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleViewDetails(application)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                <EyeIcon className="w-4 h-4" />
                Detayları Gör
              </button>
              
              {application.status === 'draft' && (
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                  Devam Et
                </button>
              )}
              
              {application.status === 'requires_documents' && (
                <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700">
                  Belge Yükle
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Başvuru bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' ? 'Henüz hiç başvuru yapmadınız.' : `${getStatusText(filter)} durumunda başvuru bulunmuyor.`}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedApplication.incentiveTitle} - Başvuru Detayları
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Kapat</span>
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Application Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Başvuru Bilgileri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Durum:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusText(selectedApplication.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sektör:</span>
                      <span className="ml-2 font-medium">{selectedApplication.sectorName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tahmini İşlem Süresi:</span>
                      <span className="ml-2 font-medium">{selectedApplication.estimatedProcessingTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tamamlanma Oranı:</span>
                      <span className="ml-2 font-medium">{selectedApplication.completionPercentage}%</span>
                    </div>
                  </div>
                </div>

                {/* Review Notes */}
                {selectedApplication.reviewNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">İnceleme Notları</h4>
                    <p className="text-sm text-gray-700">{selectedApplication.reviewNotes}</p>
                    {selectedApplication.reviewerName && (
                      <p className="text-xs text-gray-500 mt-2">
                        İnceleme: {selectedApplication.reviewerName} - {selectedApplication.reviewedAt && new Date(selectedApplication.reviewedAt).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                )}

                {/* Required Documents */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Gerekli Belgeler</h4>
                  <div className="space-y-3">
                    {selectedApplication.requiredDocuments.map((doc) => {
                      const submittedDoc = selectedApplication.submittedDocuments.find(sd => sd.documentId === doc.id);
                      return (
                        <div key={doc.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-gray-900">{doc.name}</h5>
                              <p className="text-sm text-gray-600">{doc.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Kabul edilen formatlar: {doc.fileTypes.join(', ').toUpperCase()} | Max: {doc.maxSize}MB
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.isRequired && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Zorunlu</span>
                              )}
                              {submittedDoc ? (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  submittedDoc.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  submittedDoc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submittedDoc.status === 'approved' ? 'Onaylandı' :
                                   submittedDoc.status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Yüklenmedi</span>
                              )}
                            </div>
                          </div>
                          
                          {submittedDoc && (
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{submittedDoc.fileName}</span>
                                <span className="text-gray-500">{submittedDoc.fileSize}MB</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Yüklenme: {new Date(submittedDoc.uploadedAt).toLocaleDateString('tr-TR')}
                              </div>
                              {submittedDoc.reviewNotes && (
                                <div className="text-xs text-gray-600 mt-1 italic">
                                  Not: {submittedDoc.reviewNotes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;