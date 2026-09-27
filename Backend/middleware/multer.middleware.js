// middlewares/multer.middleware.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Saves files to the 'public/uploads' folder
        cb(null, "./public"); 
    },
    filename: function (req, file, cb) {
        // Creates a unique name for the file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });