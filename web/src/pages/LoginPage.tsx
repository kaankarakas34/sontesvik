import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EyeIcon, EyeSlashIcon, SparklesIcon, ShieldCheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { login } from '../store/slices/authSlice';
import type { RootState, AppDispatch } from '../store';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setIsVisible(true);
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setFloatingElements(elements);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    
    if (login.fulfilled.match(result)) {
      const user = result.payload.user;
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'consultant':
          navigate('/consultant/dashboard');
          break;
        case 'member':
          navigate('/member/dashboard');
          break;
        default:
          navigate('/member/dashboard');
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-red-200 to-pink-200 opacity-20 animate-pulse"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animation: `float 6s ease-in-out infinite ${element.delay}s, pulse 4s ease-in-out infinite ${element.delay}s`
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-pink-50/50 -z-10" />

      <div className={`space-y-8 transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        {/* Header with Animation */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4 shadow-lg animate-bounce">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Hoş Geldiniz!
          </h2>
          
          <p className="text-lg text-gray-600 animate-fade-in">
            Teşvik dünyasına adım atın
          </p>
          
          <p className="mt-4 text-sm text-gray-500">
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              className="font-semibold text-red-600 hover:text-red-500 transition-colors duration-300 hover:underline"
            >
              Hemen kayıt olun
            </Link>
          </p>
        </div>

        {/* Modern Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm animate-shake">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
              E-posta Adresi
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="ornek@email.com"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none" />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-red-600">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-500 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 pointer-events-none" />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors duration-300 hover:underline flex items-center space-x-1"
            >
              <span>Şifrenizi mi unuttunuz?</span>
            </Link>
          </div>

          {/* Login Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </>
              ) : (
                <>
                  <RocketLaunchIcon className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Giriş Yap
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;