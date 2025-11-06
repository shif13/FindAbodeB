// backend/services/cronJobs.js
import cron from 'node-cron';
import Property from '../models/property.js';
import { Op } from 'sequelize';

// ============================================
// DAILY FEATURED PROPERTIES RECALCULATION
// ============================================
// Runs every day at 2:00 AM
export const startFeaturedPropertiesCron = () => {
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Running daily featured properties recalculation...');
    
    try {
      // Get all active, approved properties
      const properties = await Property.findAll({
        where: {
          isActive: true,
          approvalStatus: 'approved',
          isSold: false
        }
      });

      let updated = 0;
      let qualified = 0;
      let disqualified = 0;

      for (const property of properties) {
        // Skip manually featured properties
        if (property.isFeatured) continue;
        
        const wasFeatured = property.isAutoFeatured;
        const result = await property.updateFeaturedStatus();
        
        updated++;
        
        if (result.qualifies && !wasFeatured) {
          qualified++;
        } else if (!result.qualifies && wasFeatured) {
          disqualified++;
        }
      }

      // Check for expired manual featured properties
      const expiredFeatured = await Property.findAll({
        where: {
          isFeatured: true,
          featuredUntil: {
            [Op.lt]: new Date()
          }
        }
      });

      for (const property of expiredFeatured) {
        property.isFeatured = false;
        property.featuredUntil = null;
        await property.save();
      }

      console.log('✅ Featured properties recalculation completed');
      console.log(`   • Total checked: ${updated}`);
      console.log(`   • Newly qualified: ${qualified}`);
      console.log(`   • Disqualified: ${disqualified}`);
      console.log(`   • Expired manual featured: ${expiredFeatured.length}`);
      
    } catch (error) {
      console.error('❌ Featured properties cron job failed:', error);
    }
  });

  console.log('✅ Featured properties cron job scheduled (daily at 2:00 AM)');
};

// ============================================
// OPTIONAL: Run immediately on server start (for testing)
// ============================================
export const runFeaturedRecalculationNow = async () => {
  console.log('🔄 Running featured properties recalculation NOW...');
  
  try {
    const properties = await Property.findAll({
      where: {
        isActive: true,
        approvalStatus: 'approved',
        isSold: false
      }
    });

    let updated = 0;
    let qualified = 0;

    for (const property of properties) {
      if (property.isFeatured) continue;
      
      const result = await property.updateFeaturedStatus();
      updated++;
      if (result.qualifies) qualified++;
    }

    console.log('✅ Initial featured recalculation completed');
    console.log(`   • Total checked: ${updated}`);
    console.log(`   • Qualified: ${qualified}`);
    
  } catch (error) {
    console.error('❌ Initial featured recalculation failed:', error);
  }
};