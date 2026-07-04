"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    resolve: {
        alias: {
            components: path_1.default.resolve(__dirname, './src/components'),
            types: path_1.default.resolve(__dirname, './src/types'),
            apis: path_1.default.resolve(__dirname, './src/apis'),
            constants: path_1.default.resolve(__dirname, './src/constants'),
        },
    },
    server: {
        port: 5173,
        hmr: {
            path: '/vite-hmr',
        },
        proxy: {
            '/audio.wav': 'http://localhost:9000',
            '/': {
                target: 'http://localhost:9000',
                ws: true,
                changeOrigin: true,
                bypass: (req, res, options) => {
                    if (req.headers.upgrade === 'websocket' && req.url !== '/vite-hmr') {
                        return undefined; // Proxy the websocket
                    }
                    return req.url; // Let Vite serve standard HTTP requests
                },
            },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
});
