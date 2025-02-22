import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPDF = file.mimetype === "application/pdf";
        return {
            folder: isPDF ? "uploads/pdfs" : "uploads/images", 
            format: isPDF ? "pdf" : "png", 
            public_id: file.originalname.split(".")[0] + "-" + Date.now() 
        };
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Type de fichier invalide. Seuls les images (JPEG, PNG, JPG) et PDF sont autorisés."), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadP = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, 
}).fields([
    { name: 'fichierConfirmation', maxCount: 5 },
    { name: 'pdProfile', maxCount: 1 }
]);


