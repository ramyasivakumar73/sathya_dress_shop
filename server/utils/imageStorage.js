const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const cloudinarySettings = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};
const cloudinaryConfigured = Object.values(cloudinarySettings).every(Boolean);

if (cloudinaryConfigured) {
    cloudinary.config({ ...cloudinarySettings, secure: true });
}

const removeUploadTemps = async (files) => {
    await Promise.all((files || []).filter((file) => file.path).map((file) => new Promise((resolve) => {
        fs.unlink(file.path, () => resolve());
    })));
};

const getManagedCloudinaryPublicId = (imageUrl) => {
    try {
        const url = new URL(imageUrl);
        if (url.hostname !== "res.cloudinary.com") return null;

        const pathSegments = url.pathname.split("/").filter(Boolean);
        if (pathSegments.shift() !== cloudinarySettings.cloud_name) return null;
        if (pathSegments.shift() !== "image" || pathSegments.shift() !== "upload") return null;

        const versionIndex = pathSegments.findIndex((segment) => /^v\d+$/.test(segment));
        if (versionIndex !== -1) pathSegments.splice(0, versionIndex + 1);
        if (!pathSegments.length) return null;

        const lastSegment = pathSegments.length - 1;
        pathSegments[lastSegment] = pathSegments[lastSegment].replace(/\.[^.]+$/, "");
        const publicId = decodeURIComponent(pathSegments.join("/"));
        return publicId.startsWith("sathya-dress-shop/") ? publicId : null;
    } catch {
        return null;
    }
};

const storeUploadedImages = async (files = []) => {
    if (!files.length) return [];

    if (!cloudinaryConfigured) {
        if (process.env.NODE_ENV === "production") {
            await removeUploadTemps(files);
            const error = new Error("Configure Cloudinary before uploading images in production.");
            error.statusCode = 503;
            throw error;
        }
        return files.map((file) => `/uploads/${path.basename(file.path)}`);
    }

    const uploadedAssets = [];
    try {
        for (const file of files) {
            const asset = await cloudinary.uploader.upload(file.path, {
                folder: "sathya-dress-shop",
                resource_type: "image",
            });
            uploadedAssets.push(asset);
        }
        return uploadedAssets.map((asset) => asset.secure_url);
    } catch (error) {
        await Promise.all(uploadedAssets.map((asset) =>
            cloudinary.uploader.destroy(asset.public_id, { resource_type: "image" }).catch(() => { })
        ));
        throw error;
    } finally {
        await removeUploadTemps(files);
    }
};

const removeStoredImages = async (images = []) => {
    await Promise.all(images.map(async (image) => {
        if (typeof image !== "string") return;

        if (image.startsWith("/uploads/")) {
            const filePath = path.resolve(UPLOADS_DIR, path.basename(image));
            if (filePath.startsWith(UPLOADS_DIR + path.sep)) {
                await new Promise((resolve) => fs.unlink(filePath, () => resolve()));
            }
            return;
        }

        const publicId = cloudinaryConfigured ? getManagedCloudinaryPublicId(image) : null;
        if (!publicId) return;
        try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (error) {
            console.error("Cloudinary image cleanup failed:", error.http_code || error.name || "unknown");
        }
    }));
};

module.exports = { storeUploadedImages, removeStoredImages };