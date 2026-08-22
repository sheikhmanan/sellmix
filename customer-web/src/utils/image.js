// Product images are uploaded with a baked-in `w_800,c_limit` transform
// (backend/routes/upload.js). Most places only display them at a fraction
// of that size — this swaps the width so Cloudinary serves (and caches) a
// smaller derived image instead of shipping the full 800px master everywhere.
export const thumb = (url, width = 300) => (url ? url.replace(/w_\d+/, `w_${width}`) : url);
