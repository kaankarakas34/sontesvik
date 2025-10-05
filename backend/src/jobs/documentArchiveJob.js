const cron = require('node-cron');
const documentArchiveService = require('../services/documentArchiveService');

class DocumentArchiveJob {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
  }

  /**
   * Cron job'u başlatır - Her gün saat 02:00'da çalışır
   */
  start() {
    try {
      // Her gün saat 02:00'da çalış (0 2 * * *)
      this.job = cron.schedule('0 2 * * *', async () => {
        await this.runArchiveProcess();
      }, {
        scheduled: false,
        timezone: 'Europe/Istanbul'
      });

      this.job.start();
      this.updateNextRunTime();
      
      console.log('Document archive job started. Will run daily at 02:00 AM (Turkey time)');
      
      return {
        success: true,
        message: 'Document archive job started successfully',
        schedule: 'Daily at 02:00 AM (Turkey time)',
        nextRun: this.nextRun
      };
    } catch (error) {
      console.error('Error starting document archive job:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cron job'u durdurur
   */
  stop() {
    try {
      if (this.job) {
        this.job.stop();
        console.log('Document archive job stopped');
        return {
          success: true,
          message: 'Document archive job stopped successfully'
        };
      }
      return {
        success: true,
        message: 'Document archive job was not running'
      };
    } catch (error) {
      console.error('Error stopping document archive job:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Job'un durumunu döndürür
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isScheduled: this.job ? this.job.running : false,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
      schedule: 'Daily at 02:00 AM (Turkey time)'
    };
  }

  /**
   * Arşivleme işlemini manuel olarak çalıştırır
   */
  async runManually() {
    if (this.isRunning) {
      return {
        success: false,
        message: 'Archive process is already running'
      };
    }

    return await this.runArchiveProcess();
  }

  /**
   * Arşivleme işlemini çalıştırır
   */
  async runArchiveProcess() {
    if (this.isRunning) {
      console.log('Archive process is already running, skipping...');
      return {
        success: false,
        message: 'Archive process is already running'
      };
    }

    this.isRunning = true;
    const startTime = new Date();
    
    try {
      console.log(`Starting scheduled document archive process at ${startTime.toISOString()}`);
      
      const result = await documentArchiveService.archiveExpiredDocuments();
      
      this.lastRun = {
        timestamp: startTime,
        duration: Date.now() - startTime.getTime(),
        result: result
      };

      this.updateNextRunTime();

      console.log(`Document archive process completed in ${this.lastRun.duration}ms`);
      
      return {
        success: true,
        message: 'Archive process completed successfully',
        ...result,
        duration: this.lastRun.duration
      };

    } catch (error) {
      console.error('Error in scheduled document archive process:', error);
      
      this.lastRun = {
        timestamp: startTime,
        duration: Date.now() - startTime.getTime(),
        error: error.message
      };

      return {
        success: false,
        error: error.message,
        duration: this.lastRun.duration
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Bir sonraki çalışma zamanını hesaplar
   */
  updateNextRunTime() {
    if (!this.job || !this.job.running) {
      this.nextRun = null;
      return;
    }

    // Bir sonraki 02:00'ı hesapla
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);

    // Eğer şu an saat 02:00'dan önce ise bugün çalışır
    const today = new Date(now);
    today.setHours(2, 0, 0, 0);
    
    if (now < today) {
      this.nextRun = today;
    } else {
      this.nextRun = tomorrow;
    }
  }

  /**
   * Test için - 1 dakika sonra çalışacak şekilde ayarlar
   */
  startTestMode() {
    try {
      if (this.job) {
        this.job.stop();
      }

      // Test için her dakika çalış
      this.job = cron.schedule('* * * * *', async () => {
        await this.runArchiveProcess();
      }, {
        scheduled: false,
        timezone: 'Europe/Istanbul'
      });

      this.job.start();
      
      console.log('Document archive job started in TEST MODE. Will run every minute');
      
      return {
        success: true,
        message: 'Document archive job started in TEST MODE (every minute)',
        schedule: 'Every minute (TEST MODE)'
      };
    } catch (error) {
      console.error('Error starting document archive job in test mode:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new DocumentArchiveJob();