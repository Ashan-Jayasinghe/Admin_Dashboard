import multer from "multer";
import fs from "fs";
import path from "path";

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Directly specify the full path to the 'profiles' folder
    const uploadPath =
      "/Users/ashanjr/Documents/CodeQuest/CodeWeb/BackEnd/NODE/Admin-Dashboard/backend/uploads/profiles";

    // Check if the directory exists, create if not
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create the directory if it doesn't exist
    }

    cb(null, uploadPath); // Pass the path to multer
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Naming the file uniquely
  },
});

// Filter to only allow image files (optional)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only image files are allowed!"), false); // Reject the file
  }
};

// Create multer upload instance
const upload = multer({ storage, fileFilter });

// Create middleware to handle single file upload for profile image
const profileImageUpload = upload.single("profilePicture");

export default profileImageUpload;
