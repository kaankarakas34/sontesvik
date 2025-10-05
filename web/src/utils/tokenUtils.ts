import { jwtDecode } from 'jwt-decode';

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
    const currentTime = Date.now() / 1000; // Saniye cinsinden
    const expiryTime = decoded.exp;
    const timeUntilExpiry = expiryTime - currentTime;
    const bufferSeconds = bufferMinutes * 60;

    return {
      isExpired: timeUntilExpiry <= 0,
      willExpireSoon: timeUntilExpiry <= bufferSeconds && timeUntilExpiry > 0,
      expiresIn: Math.max(0, Math.floor(timeUntilExpiry / 60)), // Dakika cinsinden
      payload: decoded
    };
  } catch (error) {
    console.error('Token decode error:', error);
    return {
      isExpired: true,
      willExpireSoon: false,
      expiresIn: 0,
      payload: null
    };
  }
};

/**
 * Token'ı yeniler
 * @param refreshToken Refresh token
 * @returns Yeni access token veya null
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.accessToken || null;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
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
      return;
    }

    const { willExpireSoon, isExpired } = checkTokenExpiry(token, 10); // 10 dakika kala yenile

    if (willExpireSoon || isExpired) {
      console.log('Token yenileniyor...');
      const newToken = await refreshAccessToken(refreshToken);

      if (newToken) {
        localStorage.setItem('token', newToken);
        onRefreshSuccess(newToken);
        console.log('Token başarıyla yenilendi');
      } else {
        console.log('Token yenileme başarısız');
        onRefreshFailed();
      }
    }
  };

  // İlk kontrolü hemen yap
  checkAndRefresh();

  // Her 5 dakikada bir kontrol et
  const intervalId = setInterval(checkAndRefresh, 5 * 60 * 1000);

  return () => {
    clearInterval(intervalId);
  };
};