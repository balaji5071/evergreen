import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo_evergreen",
  api_key: process.env.CLOUDINARY_API_KEY || "123456789012345",
  api_secret: process.env.CLOUDINARY_API_SECRET || "abcdefghijklmnopqrstuvwxyz123",
  secure: true,
});

export async function uploadImageToCloudinary(fileStr: string): Promise<string> {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === "demo_evergreen") {
      // Fallback if Cloudinary is not configured with live production credentials
      return fileStr;
    }
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "evergreen_restaurant",
      resource_type: "auto",
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Return original image string or fallback URL
    return fileStr;
  }
}

export default cloudinary;
