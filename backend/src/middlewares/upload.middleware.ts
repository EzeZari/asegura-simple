import multer from 'multer';

// 🔥 EN LUGAR DE DISK STORAGE, USAMOS MEMORY STORAGE
// Esto guarda el archivo en la RAM del servidor por un segundo, lo justo para pasárselo a Supabase.
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF.'));
    }
  }
});