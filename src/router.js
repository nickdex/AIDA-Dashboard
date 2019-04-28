import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Admin from './views/Admin.vue';

import IotDevice from './components/IotDevice';
import Room from './components/Room';

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        const deviceGroupId = localStorage.getItem('defaultDeviceGroupId');
        if (deviceGroupId) {
          next(`/home/${deviceGroupId}`);
        } else next();
      }
    },
    {
      path: '/home/:id',
      name: 'home',
      component: Home
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      children: [
        { path: 'devices', component: IotDevice, name: 'devices' },
        { path: 'rooms', component: Room, name: 'rooms' }
      ]
    },
    {
      path: '*',
      component: Login
    }
  ]
});
