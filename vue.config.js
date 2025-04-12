module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://82.144.67.254:9000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '', // Убираем /api перед запросом к серверу
        },
      },
    },
  },
};
