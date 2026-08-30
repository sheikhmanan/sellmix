// Product images are uploaded with a default `?w=800` resize param
// (backend/routes/upload.js, served by backend/routes/images.js). Most
// places only display them at a fraction of that size — this swaps the
// width so the backend serves (and caches) a smaller derived image instead
// of shipping the full 800px master everywhere.
export const thumb = (url, width = 300) => (url ? url.replace(/w=\d+/, `w=${width}`) : url);
