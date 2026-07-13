import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import '../config/cloudinary.js'


const storage=new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'judgeX',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => {
      return `avatar_${Date.now()}_${file.originalname.split('.')[0]}`;
    }
  }
})

const upload = multer({ storage })

export default upload


