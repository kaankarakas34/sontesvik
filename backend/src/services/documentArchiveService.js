const { DocumentType, Document } = require('../models');
const { Op } = require('sequelize');

class DocumentArchiveService {
  /**
   * Geçerlilik tarihi dolmuş belge türlerini kontrol eder ve ilgili belgeleri arşivler
   */
  async archiveExpiredDocuments() {
    try {
      console.log('Starting document archive process...');
      
      // Geçerlilik tarihi dolmuş ve hala aktif olan belge türlerini bul
      const expiredDocumentTypes = await DocumentType.findAll({
        where: {
          validityDate: {
            [Op.lt]: new Date() // Bugünden önceki tarihler
          },
          isActive: true // Hala aktif olanlar
        }
      });

      if (expiredDocumentTypes.length === 0) {
        console.log('No expired document types found.');
        return { success: true, archivedCount: 0, deactivatedTypes: 0 };
      }

      console.log(`Found ${expiredDocumentTypes.length} expired document types.`);

      let totalArchivedDocuments = 0;
      let deactivatedTypesCount = 0;

      for (const documentType of expiredDocumentTypes) {
        try {
          // Bu belge türüne ait aktif belgeleri bul ve arşivle
          const documentsToArchive = await Document.findAll({
            where: {
              documentTypeId: documentType.id,
              status: {
                [Op.ne]: 'archived' // Zaten arşivlenmemiş olanlar
              }
            }
          });

          // Belgeleri arşivle
          if (documentsToArchive.length > 0) {
            await Document.update(
              { 
                status: 'archived',
                archivedAt: new Date(),
                archivedReason: `Document type expired on ${documentType.validityDate.toISOString().split('T')[0]}`
              },
              {
                where: {
                  id: {
                    [Op.in]: documentsToArchive.map(doc => doc.id)
                  }
                }
              }
            );

            totalArchivedDocuments += documentsToArchive.length;
            console.log(`Archived ${documentsToArchive.length} documents for document type: ${documentType.name}`);
          }

          // Belge türünü deaktif et
          await documentType.update({
            isActive: false,
            deactivatedAt: new Date(),
            deactivationReason: 'Validity date expired'
          });

          deactivatedTypesCount++;
          console.log(`Deactivated document type: ${documentType.name} (ID: ${documentType.id})`);

        } catch (error) {
          console.error(`Error processing document type ${documentType.id}:`, error);
          // Bir belge türünde hata olsa bile diğerlerini işlemeye devam et
        }
      }

      console.log(`Archive process completed. Archived ${totalArchivedDocuments} documents and deactivated ${deactivatedTypesCount} document types.`);

      return {
        success: true,
        archivedCount: totalArchivedDocuments,
        deactivatedTypes: deactivatedTypesCount,
        processedTypes: expiredDocumentTypes.map(dt => ({
          id: dt.id,
          name: dt.name,
          validityDate: dt.validityDate
        }))
      };

    } catch (error) {
      console.error('Error in document archive process:', error);
      return {
        success: false,
        error: error.message,
        archivedCount: 0,
        deactivatedTypes: 0
      };
    }
  }

  /**
   * Belirli bir belge türünü manuel olarak arşivler
   */
  async archiveDocumentType(documentTypeId, reason = 'Manual archive') {
    try {
      const documentType = await DocumentType.findByPk(documentTypeId);
      
      if (!documentType) {
        throw new Error('Document type not found');
      }

      // Bu belge türüne ait aktif belgeleri bul
      const documentsToArchive = await Document.findAll({
        where: {
          documentTypeId: documentType.id,
          status: {
            [Op.ne]: 'archived'
          }
        }
      });

      // Belgeleri arşivle
      if (documentsToArchive.length > 0) {
        await Document.update(
          { 
            status: 'archived',
            archivedAt: new Date(),
            archivedReason: reason
          },
          {
            where: {
              id: {
                [Op.in]: documentsToArchive.map(doc => doc.id)
              }
            }
          }
        );
      }

      // Belge türünü deaktif et
      await documentType.update({
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason
      });

      return {
        success: true,
        archivedCount: documentsToArchive.length,
        documentType: {
          id: documentType.id,
          name: documentType.name
        }
      };

    } catch (error) {
      console.error('Error archiving document type:', error);
      return {
        success: false,
        error: error.message,
        archivedCount: 0
      };
    }
  }

  /**
   * Arşivlenmiş belgeleri geri yükler (restore)
   */
  async restoreArchivedDocuments(documentTypeId) {
    try {
      const documentType = await DocumentType.findByPk(documentTypeId);
      
      if (!documentType) {
        throw new Error('Document type not found');
      }

      // Bu belge türüne ait arşivlenmiş belgeleri bul
      const archivedDocuments = await Document.findAll({
        where: {
          documentTypeId: documentType.id,
          status: 'archived'
        }
      });

      if (archivedDocuments.length === 0) {
        return {
          success: true,
          restoredCount: 0,
          message: 'No archived documents found for this document type'
        };
      }

      // Belgeleri geri yükle
      await Document.update(
        { 
          status: 'active',
          archivedAt: null,
          archivedReason: null
        },
        {
          where: {
            id: {
              [Op.in]: archivedDocuments.map(doc => doc.id)
            }
          }
        }
      );

      return {
        success: true,
        restoredCount: archivedDocuments.length,
        documentType: {
          id: documentType.id,
          name: documentType.name
        }
      };

    } catch (error) {
      console.error('Error restoring archived documents:', error);
      return {
        success: false,
        error: error.message,
        restoredCount: 0
      };
    }
  }
}

module.exports = new DocumentArchiveService();