import '@babel/polyfill';
import Vue from 'vue';
import feathers from '@feathersjs/client';

import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.config.productionTip = false;

var app = feathers();
app.configure(feathers.rest().fetch(window.fetch));

Vue.prototype.$feathers = app;

window.vueInstance = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
