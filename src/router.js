import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import Shell from './views/Shell.vue';
import LoginBase from './views/LoginBase';
import Admin from './views/Admin.vue';

import IotDevice from './components/IotDevice';
import Room from './components/Room';
import Agent from './components/Agent';

Vue.use(Router);

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginBase,
      beforeEnter: (to, from, next) => {
        const deviceGroupId = localStorage.getItem('defaultDeviceGroupId');
        if (deviceGroupId) {
          next(`/app/home/${deviceGroupId}`);
        } else next();
      }
    },
    {
      path: '/app',
      name: 'shell',
      component: Shell,
      children: [{ path: 'home/:id', name: 'home', component: Home }]
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin,
      children: [
        { path: 'devices', component: IotDevice, name: 'devices' },
        { path: 'rooms', component: Room, name: 'rooms' },
        { path: 'agents', component: Agent, name: 'agents' }
      ]
    },
    {
      path: '*',
      component: LoginBase
    }
  ]
});
