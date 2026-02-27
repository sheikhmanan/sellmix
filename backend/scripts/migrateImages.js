/**
 * One-time migration script: upload all images from uploads/ to Cloudinary.
 *
 * Run from backend folder:
 *   node scripts/migrateImages.js
 */

const dotenv = require('dotenv');
dotenv.config();

const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const run = async () => {
  const files = fs.readdirSync(UPLOADS_DIR).filter((f) =>
    ALLOWED_EXTS.includes(path.extname(f).toLowerCase())
  );

  if (!files.length) {
    console.log('No image files found in uploads/');
    return;
  }

  console.log(`Found ${files.length} images. Uploading to Cloudinary...\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    const publicId = path.parse(file).name; // filename without extension

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'sellmix/products',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      });
      console.log(`✅  ${file}  →  ${result.secure_url}`);
      success++;
    } catch (err) {
      console.error(`❌  ${file}  →  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Migration complete: ${success} uploaded, ${failed} failed`);
  console.log(`Cloudinary folder: sellmix/products`);
  console.log(`\nNext step: run  node seed.js  to re-seed the database`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
};

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
