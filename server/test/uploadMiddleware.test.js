const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { test } = require("node:test");
const express = require("express");
const upload = require("../middleware/upload");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

test("Multer accepts image uploads and rejects non-image files", async (t) => {
    const savedFiles = [];
    const app = express();
    app.post("/upload", upload.array("images", 6), (req, res) => {
        const filenames = req.files.map((file) => file.filename);
        savedFiles.push(...filenames);
        res.json({ filenames });
    });
    app.use((error, req, res, next) => {
        res.status(400).json({ code: error.code });
    });

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    t.after(async () => {
        await new Promise((resolve) => server.close(resolve));
        savedFiles.forEach((filename) => fs.rmSync(path.join(UPLOADS_DIR, filename), { force: true }));
    });

    const form = new FormData();
    form.append("images", new Blob([Uint8Array.from([0xff, 0xd8, 0xff])], { type: "image/jpeg" }), "dress.jpg");
    const uploadResponse = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
        method: "POST",
        body: form,
    });
    assert.equal(uploadResponse.status, 200);
    const { filenames } = await uploadResponse.json();
    assert.equal(filenames.length, 1);
    assert.equal(fs.existsSync(path.join(UPLOADS_DIR, filenames[0])), true);

    const invalidForm = new FormData();
    invalidForm.append("images", new Blob(["not an image"], { type: "text/plain" }), "notes.txt");
    const invalidResponse = await fetch(`http://127.0.0.1:${server.address().port}/upload`, {
        method: "POST",
        body: invalidForm,
    });
    assert.equal(invalidResponse.status, 400);
    assert.deepEqual(await invalidResponse.json(), { code: "INVALID_FILE_TYPE" });
});