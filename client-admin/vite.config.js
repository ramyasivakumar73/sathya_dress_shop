import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react({ include: /\.[jt]sx?$/ })],
    esbuild: {
        loader: "jsx",
        include: /src\/.*\.js$/,
        exclude: [],
    },
    optimizeDeps: {
        entries: ["index.html"],
        esbuildOptions: {
            loader: { ".js": "jsx" },
        },
    },
});