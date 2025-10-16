import React from 'react';
import { FileText, Clock, Construction } from 'lucide-react';

const DocumentManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Belge Yönetim Sistemi
            </h1>
            <p className="text-blue-100 text-lg">
              Gelişmiş doküman yönetim çözümü
            </p>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
              <Construction className="w-8 h-8 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sistem Geliştirme Aşamasında
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Belge yönetim sistemi şu anda aktif geliştirme aşamasındadır. 
              Çok yakında tüm belgelerinizi kolayca yönetebileceğiniz gelişmiş özelliklerle hizmetinizde olacağız.
            </p>

            {/* Features Preview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Yakında</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Gelişmiş belge yükleme ve yönetim özellikleri
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-gray-800">Otomasyon</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Teşvik bazlı otomatik belge organizasyonu
                </p>
              </div>
            </div>

            {/* Current System Info */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">
                Mevcut Sistem
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Şu anda her teşvik için belgeler doğrudan teşvik odasına (room) yüklenmektedir. 
                Oda silindiğinde tüm belgeler otomatik olarak silinir ve her yeni oda için 
                belgeler sıfırdan tekrar yüklenir.
              </p>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Daha fazla bilgi için sistem yöneticisi ile iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;