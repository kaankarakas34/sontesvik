import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/api.config';
import axios from 'axios';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Token'ın süresinin dolup dolmadığını kontrol eder
 * @param token JWT token
 * @param bufferMinutes Token süresi dolmadan kaç dakika önce uyarı verilecek
 * @returns { isExpired: boolean, willExpireSoon: boolean, expiresIn: number }
 */
export const checkTokenExpiry = (token: string, bufferMinutes: number = 5) => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const bufferTime = bufferMinutes * 60;

    const isExpired = currentTime >= expirationTime;
    const willExpireSoon = currentTime >= (expirationTime - bufferTime);
    const expiresIn = Math.floor((expirationTime - currentTime) / 60); // dakika cinsinden

    console.log('Token expiry check:', {
      currentTime: new Date(currentTime * 1000).toISOString(),
      expirationTime: new Date(expirationTime * 1000).toISOString(),
      isExpired,
      willExpireSoon,
      expiresIn: `${expiresIn} dakika`,
      bufferMinutes
    });

    return {
      isExpired,
      willExpireSoon,
      expiresIn,
      expirationTime,
      currentTime
    };
  } catch (error) {
    console.error('Token decode hatası:', error);
    return {
      isExpired: true,
      willExpireSoon: true,
      expiresIn: 0,
      expirationTime: 0,
      currentTime: Math.floor(Date.now() / 1000)
    };
  }
};

/**
 * Token'ı yeniler
 * @param refreshToken Refresh token
 * @returns Yeni access token veya null
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  console.log('Attempting to refresh access token...');
  try {
    const response = await axios.post('/api/auth/refresh-token', {
      refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true // Cookie'lerin gönderilmesi için kritik
    });

    if (response.data?.accessToken) {
      console.log('Access token refreshed successfully.');
      // Yeni refresh token localStorage'da güncellenmez çünkü backend cookie olarak yönetiyor
      return response.data.accessToken;
    }

    console.error('Token refresh failed:', { status: response.status, message: response.data?.message || 'No error message' });
    return null;
  } catch (error) {
    console.error('An unexpected error occurred during token refresh:', error);
    return null;
  }
};

/**
* Token süresini düzenli olarak kontrol eder
* @param onTokenExpired Token süresi dolduğunda çağrılacak fonksiyon
* @param onTokenWillExpire Token süresi dolmak üzereyken çağrılacak fonksiyon
* @param checkInterval Kontrol aralığı (ms)
*/
export const startTokenExpiryChecker = (
  onTokenExpired: () => void,
  onTokenWillExpire: () => void,
  checkInterval: number = 60000 // 1 dakika
) => {
  let lastWarningShown = false;

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const { isExpired, willExpireSoon, expiresIn } = checkTokenExpiry(token);

    if (isExpired) {
      console.log('Token süresi doldu, çıkış yapılıyor...');
      onTokenExpired();
      lastWarningShown = false;
    } else if (willExpireSoon && !lastWarningShown) {
      console.log(`Token süresi ${expiresIn} dakika içinde dolacak`);
      onTokenWillExpire();
      lastWarningShown = true;
    } else if (!willExpireSoon) {
      lastWarningShown = false;
    }
  };

  // İlk kontrolü hemen yap
  checkToken();

  // Düzenli kontrolü başlat
  const intervalId = setInterval(checkToken, checkInterval);

  // Temizleme fonksiyonu
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Otomatik token yenileme
 * @param onRefreshSuccess Token başarıyla yenilendiğinde
 * @param onRefreshFailed Token yenileme başarısız olduğunda
 */
export const startAutoTokenRefresh = (
  onRefreshSuccess: (newToken: string) => void,
  onRefreshFailed: () => void
) => {
  const checkAndRefresh = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token || !refreshToken) {
      console.log('Token veya refresh token bulunamadı');
      return;
    }

    const { willExpireSoon, isExpired, expiresIn } = checkTokenExpiry(token, 30); // 30 dakika kala yenile

    console.log('Token durumu:', { willExpireSoon, isExpired, expiresIn });

    if (willExpireSoon || isExpired) {
      console.log('Token yenileniyor... Kalan süre:', expiresIn, 'dakika');
      const newToken = await refreshAccessToken(refreshToken);

      if (newToken) {
        localStorage.setItem('token', newToken);
        onRefreshSuccess(newToken);
        console.log('Token başarıyla yenilendi');
      } else {
        console.log('Token yenileme başarısız, kullanıcı çıkış yapılıyor');
        onRefreshFailed();
      }
    }
  };

  // İlk kontrolü hemen yap
  checkAndRefresh();

  // Her 2 dakikada bir kontrol et (daha sık)
  const intervalId = setInterval(checkAndRefresh, 2 * 60 * 1000);

  return () => {
    clearInterval(intervalId);
  };
};