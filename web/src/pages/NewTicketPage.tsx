import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createTicket } from '../store/slices/ticketSlice';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../types/ticket';
import { FiArrowLeft, FiSend, FiAlertCircle, FiUser, FiFileText, FiFlag, FiLayers } from 'react-icons/fi';

const NewTicketPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Ticket, 'id'>>({
    title: '',
    description: '',
    type: 'technical',
    priority: 'medium',
    status: 'open',
    userId: user?.id || '',
    sectorId: user?.sectorId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await dispatch(createTicket(formData));
      navigate('/tickets');
    } catch (error) {
      console.error('Ticket oluşturma hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/tickets');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span className="font-medium">Geri Dön</span>
              </button>
              <div className="h-6 w-px bg-red-200"></div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Destek Talebi</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Destek Talebi Oluştur</h2>
                <p className="text-red-100 text-sm mt-1">
                  Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede yardımcı olalım.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FiUser className="w-4 h-4 text-red-500" />
                <span>Konu Başlığı</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Sorununuzu özetleyen bir başlık yazın..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <FiFileText className="w-4 h-4 text-red-500" />
                <span>Detaylı Açıklama</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Sorununuzu mümkün olduğunca detaylı bir şekilde açıklayın. Hangi adımları izlediğinizi, ne tür bir hata aldığınızı veya hangi konuda yardıma ihtiyacınız olduğunu belirtin..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200 text-gray-900 placeholder-gray-400 resize-none"
              />
            </div>

            {/* Type and Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <FiLayers className="w-4 h-4 text-red-500" />
                  <span>Talep Türü</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200 text-gray-900 bg-white"
                >
                  <option value="technical">Teknik Destek</option>
                  <option value="consultant">Danışman Desteği</option>
                </select>
              </div>

              {/* Priority Field */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <FiFlag className="w-4 h-4 text-red-500" />
                  <span>Öncelik Seviyesi</span>
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 transition-colors duration-200 text-gray-900 bg-white"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Destek Talebi Hakkında:</p>
                  <ul className="space-y-1 text-red-600">
                    <li>• Teknik destek talepleri sistem yöneticilerimiz tarafından incelenecektir.</li>
                    <li>• Danışman desteği talepleri sektör uzmanlarımıza yönlendirilecektir.</li>
                    <li>• Yüksek öncelikli talepler 24 saat içinde yanıtlanacaktır.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleGoBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    <span>Destek Talebi Gönder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTicketPage;