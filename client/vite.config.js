export default {
  server: {
    proxy: {
      "/chat": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/speech-to-text": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/text-to-speech": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
