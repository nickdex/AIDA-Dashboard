import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: { isOnline: false },
  mutations: {
    online: state => (state.isOnline = true),
    offline: state => (state.isOnline = false)
  },
  actions: {}
});
