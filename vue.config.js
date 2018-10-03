module.exports = {
  pwa: {
    name: 'AIDA-Dashboard',
    workboxPluginMode: 'InjectManifest'
  },
  devServer: {
    proxy:
      process.env.NODE_ENV === 'production'
        ? 'https://aida-server.herokuapp.com/'
        : 'http://localhost:3000'
  }
};
