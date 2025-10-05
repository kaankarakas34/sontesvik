const express = require('express');
const router = express.Router();
const ApplicationRoomController = require('../controllers/applicationRoomController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer konfigürasyonu - belge yükleme için
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya türü'));
    }
  }
});

// Tüm route'lar authentication gerektirir
router.use(authenticateToken);

// Room listesi ve yönetimi
router.get('/', ApplicationRoomController.getUserRooms);
router.get('/by-application/:applicationId', ApplicationRoomController.getRoomByApplicationId);
router.get('/:roomId', ApplicationRoomController.getRoomById);

// Room mesajları
router.get('/:roomId/messages', ApplicationRoomController.getRoomMessages);
router.post('/:roomId/messages', ApplicationRoomController.sendRoomMessage);

// Room belgeleri
router.get('/:roomId/documents', ApplicationRoomController.getRoomDocuments);
router.post('/:roomId/documents', upload.single('document'), ApplicationRoomController.uploadRoomDocument);

// Room yönetimi (Danışman/Admin)
router.patch('/:roomId/priority', ApplicationRoomController.updateRoomPriority);
router.patch('/:roomId/status', ApplicationRoomController.updateRoomStatus);
router.post('/:roomId/notes', ApplicationRoomController.addConsultantNote);

module.exports = router;