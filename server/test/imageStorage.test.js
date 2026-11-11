const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

process.env.CLOUDINARY_CLOUD_NAME = "";
process.env.CLOUDINARY_API_KEY = "";
process.env.CLOUDINARY_API_SECRET = "";

const { storeUploadedImages } = require("../utils/imageStorage");

test("uses local upload URLs when Cloudinary is not configured in development", async () => {
    process.env.NODE_ENV = "development";
    const filePath = path.join(os.tmpdir(), "sample-dress.jpg");

    assert.deepEqual(await storeUploadedImages([{ path: filePath }]), ["/uploads/sample-dress.jpg"]);
});

test("rejects production uploads without Cloudinary and removes the temporary file", async () => {
    process.env.NODE_ENV = "production";
    const filePath = path.join(os.tmpdir(), `shop-upload-${process.pid}.jpg`);
    fs.writeFileSync(filePath, "test image");

    try {
        await assert.rejects(storeUploadedImages([{ path: filePath }]), (error) => error.statusCode === 503);
        assert.equal(fs.existsSync(filePath), false);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
});