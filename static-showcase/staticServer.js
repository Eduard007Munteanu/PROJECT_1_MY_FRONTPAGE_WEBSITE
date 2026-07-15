const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 5500);
const ROOT = __dirname;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
    ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((request, response) => {
    const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const normalizedPath = path.normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[\\/])+/, "");
    const filePath = path.join(ROOT, normalizedPath);

    if (!filePath.startsWith(ROOT)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            response.end("Not found");
            return;
        }

        const resolvedPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
        const extension = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[extension] || "application/octet-stream";

        fs.readFile(resolvedPath, (readError, fileBuffer) => {
            if (readError) {
                response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                response.end("Not found");
                return;
            }

            response.writeHead(200, { "Content-Type": contentType });
            response.end(fileBuffer);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Static showcase running on http://localhost:${PORT}`);
});
