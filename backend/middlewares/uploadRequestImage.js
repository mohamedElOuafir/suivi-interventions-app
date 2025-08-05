import cloudinary from '../uploadImages/cloudinary.js';
import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
    cloudinary,
    params : {
        folder : 'requests-images',
        allowed_formats : ['jpeg', 'jpg', 'png', 'webp']
    }
});


export const upload = multer({storage});
