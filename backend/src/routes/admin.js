const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const documentArchiveService = require('../services/documentArchiveService');
const documentArchiveJob = require('../jobs/documentArchiveJob');

// Tüm admin rotaları için koruma ve admin yetkisi gerekli
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/admin/archive/status
 * @desc    Belge arşivleme job'unun durumunu getir
 * @access  Admin
 */
router.get('/archive/status', async (req, res) => {
  try {
    const status = documentArchiveJob.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting archive job status:', error);
    res.status(500).json({
      success: false,
      message: 'Arşiv job durumu alınırken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/run
 * @desc    Belge arşivleme işlemini manuel olarak çalıştır
 * @access  Admin
 */
router.post('/archive/run', async (req, res) => {
  try {
    const result = await documentArchiveJob.runManually();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Arşivleme işlemi başarıyla tamamlandı',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Arşivleme işlemi başarısız',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error running archive process manually:', error);
    res.status(500).json({
      success: false,
      message: 'Arşivleme işlemi çalıştırılırken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/start
 * @desc    Belge arşivleme job'unu başlat
 * @access  Admin
 */
router.post('/archive/start', async (req, res) => {
  try {
    const result = documentArchiveJob.start();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Arşivleme job\'u başarıyla başlatıldı',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Arşivleme job\'u başlatılamadı',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error starting archive job:', error);
    res.status(500).json({
      success: false,
      message: 'Arşivleme job\'u başlatılırken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/stop
 * @desc    Belge arşivleme job'unu durdur
 * @access  Admin
 */
router.post('/archive/stop', async (req, res) => {
  try {
    const result = documentArchiveJob.stop();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Arşivleme job\'u başarıyla durduruldu',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Arşivleme job\'u durdurulamadı',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error stopping archive job:', error);
    res.status(500).json({
      success: false,
      message: 'Arşivleme job\'u durdurulurken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/document-type/:id
 * @desc    Belirli bir belge türünü manuel olarak arşivle
 * @access  Admin
 */
router.post('/archive/document-type/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const result = await documentArchiveService.archiveDocumentType(
      id, 
      reason || 'Manuel arşivleme'
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Belge türü başarıyla arşivlendi',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Belge türü arşivlenemedi',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error archiving document type:', error);
    res.status(500).json({
      success: false,
      message: 'Belge türü arşivlenirken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/restore/:id
 * @desc    Arşivlenmiş belgeleri geri yükle
 * @access  Admin
 */
router.post('/archive/restore/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await documentArchiveService.restoreArchivedDocuments(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Arşivlenmiş belgeler başarıyla geri yüklendi',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Belgeler geri yüklenemedi',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error restoring archived documents:', error);
    res.status(500).json({
      success: false,
      message: 'Belgeler geri yüklenirken hata oluştu',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/archive/test-mode
 * @desc    Test modu için arşivleme job'unu başlat (her dakika çalışır)
 * @access  Admin
 */
router.post('/archive/test-mode', async (req, res) => {
  try {
    const result = documentArchiveJob.startTestMode();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Arşivleme job\'u test modunda başlatıldı (her dakika çalışır)',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Test modu başlatılamadı',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error starting test mode:', error);
    res.status(500).json({
      success: false,
      message: 'Test modu başlatılırken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;