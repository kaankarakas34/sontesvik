const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);
router.use(adminOnly); // Only admin can access logs

// Get logs endpoint
router.get('/', async (req, res) => {
  try {
    const { type = 'error', page = 1, limit = 50, date } = req.query;
    const logsDir = path.join(__dirname, '../../logs');
    
    // Validate log type
    const validTypes = ['error', 'combined', 'http', 'exceptions', 'rejections'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz log tipi. Geçerli tipler: ' + validTypes.join(', ')
      });
    }

    // Get log files based on type and date
    let logFiles = [];
    try {
      const files = await fs.readdir(logsDir);
      
      if (date) {
        // Specific date
        const fileName = `${type}-${date}.log`;
        if (files.includes(fileName)) {
          logFiles = [fileName];
        }
      } else {
        // Get all files of this type, sorted by date (newest first)
        logFiles = files
          .filter(file => file.startsWith(`${type}-`) && file.endsWith('.log'))
          .sort((a, b) => {
            const dateA = a.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
            const dateB = b.match(/(\d{4}-\d{2}-\d{2})/)?.[1];
            return dateB?.localeCompare(dateA) || 0;
          });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Log dosyaları okunamadı',
        error: error.message
      });
    }

    if (logFiles.length === 0) {
      return res.json({
        success: true,
        data: {
          logs: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0
          },
          availableDates: []
        }
      });
    }

    // Read and parse log files
    let allLogs = [];
    
    for (const fileName of logFiles) {
      try {
        const filePath = path.join(logsDir, fileName);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const lines = fileContent.trim().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const logEntry = JSON.parse(line);
            allLogs.push({
              ...logEntry,
              file: fileName,
              id: `${fileName}-${logEntry.timestamp}-${Math.random().toString(36).substr(2, 9)}`
            });
          } catch (parseError) {
            // If JSON parsing fails, treat as plain text log
            allLogs.push({
              timestamp: new Date().toISOString(),
              level: 'info',
              message: line,
              file: fileName,
              id: `${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            });
          }
        }
      } catch (fileError) {
        console.error(`Error reading log file ${fileName}:`, fileError);
      }
    }

    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    // Get available dates for filtering
    const availableDates = [...new Set(
      allLogs.map(log => log.timestamp?.split('T')[0]).filter(Boolean)
    )].sort().reverse();

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allLogs.length,
          totalPages: Math.ceil(allLogs.length / parseInt(limit))
        },
        availableDates,
        logTypes: validTypes
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Loglar alınırken hata oluştu',
      error: error.message
    });
  }
});

// Get log statistics
router.get('/stats', async (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../../logs');
    const stats = {
      totalFiles: 0,
      filesByType: {},
      latestLogs: {},
      diskUsage: 0
    };

    try {
      const files = await fs.readdir(logsDir);
      stats.totalFiles = files.length;

      for (const file of files) {
        const filePath = path.join(logsDir, file);
        const fileStat = await fs.stat(filePath);
        stats.diskUsage += fileStat.size;

        // Extract log type from filename
        const typeMatch = file.match(/^([^-]+)-/);
        if (typeMatch) {
          const type = typeMatch[1];
          if (!stats.filesByType[type]) {
            stats.filesByType[type] = 0;
          }
          stats.filesByType[type]++;

          // Get latest log entry for each type
          if (!stats.latestLogs[type] || file > stats.latestLogs[type].file) {
            try {
              const content = await fs.readFile(filePath, 'utf8');
              const lines = content.trim().split('\n').filter(line => line.trim());
              if (lines.length > 0) {
                const lastLine = lines[lines.length - 1];
                try {
                  const logEntry = JSON.parse(lastLine);
                  stats.latestLogs[type] = {
                    file,
                    timestamp: logEntry.timestamp,
                    level: logEntry.level,
                    message: logEntry.message
                  };
                } catch (parseError) {
                  stats.latestLogs[type] = {
                    file,
                    timestamp: fileStat.mtime.toISOString(),
                    level: 'info',
                    message: lastLine
                  };
                }
              }
            } catch (readError) {
              console.error(`Error reading ${file}:`, readError);
            }
          }
        }
      }

      // Convert bytes to MB
      stats.diskUsage = Math.round(stats.diskUsage / (1024 * 1024) * 100) / 100;

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Log istatistikleri alınamadı',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({
      success: false,
      message: 'Log istatistikleri alınırken hata oluştu',
      error: error.message
    });
  }
});

// Clear logs endpoint (admin only)
router.delete('/clear', async (req, res) => {
  try {
    const { type, date } = req.query;
    const logsDir = path.join(__dirname, '../../logs');

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Log tipi belirtilmelidir'
      });
    }

    const validTypes = ['error', 'combined', 'http', 'exceptions', 'rejections'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz log tipi'
      });
    }

    let deletedFiles = 0;
    const files = await fs.readdir(logsDir);
    
    for (const file of files) {
      if (file.startsWith(`${type}-`) && file.endsWith('.log')) {
        if (date && !file.includes(date)) {
          continue; // Skip if specific date requested and doesn't match
        }
        
        try {
          await fs.unlink(path.join(logsDir, file));
          deletedFiles++;
        } catch (error) {
          console.error(`Error deleting ${file}:`, error);
        }
      }
    }

    res.json({
      success: true,
      message: `${deletedFiles} log dosyası silindi`,
      data: { deletedFiles }
    });

  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({
      success: false,
      message: 'Loglar silinirken hata oluştu',
      error: error.message
    });
  }
});

module.exports = router;