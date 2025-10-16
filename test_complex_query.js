const { sequelize } = require('./backend/src/models');

async function testComplexQuery() {
  try {
    console.log('Testing complex incentive query with joins...');
    
    const query = `
      SELECT "Incentive"."id", "Incentive"."title", "Incentive"."description", 
             "Incentive"."incentive_type" AS "incentiveType", "Incentive"."status", 
             "Incentive"."provider", "Incentive"."provider_type" AS "providerType", 
             "Incentive"."application_deadline" AS "applicationDeadline", 
             "Incentive"."start_date" AS "startDate", "Incentive"."end_date" AS "endDate", 
             "Incentive"."max_amount" AS "maxAmount", "Incentive"."min_amount" AS "minAmount", 
             "Incentive"."currency", "Incentive"."eligibility_criteria" AS "eligibilityCriteria", 
             "Incentive"."required_documents" AS "requiredDocuments", 
             "Incentive"."application_url" AS "applicationUrl", "Incentive"."tags", 
             "Incentive"."view_count" AS "viewCount", "Incentive"."application_count" AS "applicationCount", 
             "Incentive"."completion_rate" AS "completionRate", "Incentive"."rating", 
             "Incentive"."region", "Incentive"."country", "Incentive"."sector_id", 
             "Incentive"."incentive_type_id" AS "incentiveTypeId", "Incentive"."deleted_at" AS "deletedAt", 
             "sector"."id" AS "sector.id", "sector"."name" AS "sector.name", 
             "sector"."code" AS "sector.code", "incentiveTypeModel"."id" AS "incentiveTypeModel.id", 
             "incentiveTypeModel"."name" AS "incentiveTypeModel.name", 
             "incentiveTypeModel"."code" AS "incentiveTypeModel.code" 
      FROM "Incentives" AS "Incentive" 
      LEFT OUTER JOIN "Sectors" AS "sector" ON "Incentive"."sector_id" = "sector"."id" 
        AND ("sector"."deleted_at" IS NULL) 
      LEFT OUTER JOIN "IncentiveTypes" AS "incentiveTypeModel" ON "Incentive"."incentive_type_id" = "incentiveTypeModel"."id" 
      WHERE ("Incentive"."deleted_at" IS NULL AND "Incentive"."status" = 'active') 
      ORDER BY "Incentive"."title" ASC 
      LIMIT 20 OFFSET 0
    `;
    
    const [results] = await sequelize.query(query);
    console.log('Query successful, found:', results.length, 'incentives');
    
  } catch (error) {
    console.error('SQL Error:', error.message);
    console.error('Error details:', error);
  } finally {
    await sequelize.close();
  }
}

testComplexQuery();