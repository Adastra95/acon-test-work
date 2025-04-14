// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://82.144.67.254:9001',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '', // убирает /api при отправке на сервер
        },
      },
    },
  },
};
