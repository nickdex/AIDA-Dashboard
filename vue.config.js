const path = require('path');

module.exports = {
  pwa: {
    name: 'AIDA-Dashboard',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      swSrc: path.join('src', 'service-worker.js')
    }
  },
  devServer: {
    proxy:
      process.env.NODE_ENV === 'production'
        ? 'https://aida-server.herokuapp.com/'
        : 'http://localhost:3000'
  }
};
