import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dwb5foa8m',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  upload_preset: 'cokins_preset'
});

export default cloudinary; 