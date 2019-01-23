import Vue from 'vue';
import Vuex from 'vuex';

import * as types from './mutation-types';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isOnline: false,
    deviceGroups: null,
    deviceGroupId: '',
    devices: null
  },
  mutations: {
    [types.ONLINE]: state => (state.isOnline = true),
    [types.OFFLINE]: state => (state.isOnline = false),
    [types.DEVICE]: (state, device) =>
      (state.devices = { ...state.devices, [device._id]: device }),
    [types.DEVICES]: (state, devices) => (state.devices = devices),
    [types.DEVICE_GROUPS]: (state, deviceGroups) =>
      (state.deviceGroups = deviceGroups),
    [types.DEVICE_GROUP_ID]: (state, deviceGroupId) =>
      (state.deviceGroupId = deviceGroupId)
  },
  actions: {
    toggleDeviceLoading({ commit, state }, _id) {
      commit(types.DEVICE, {
        ...state.devices[_id],
        reqFlag: !state.devices[_id].reqFlag
      });
    },
    async updateDevice({ commit }, { device }) {
      const _id = device._id;
      const result = await this._vm.$feathers.service('devices').patch(_id, {
        isOn: !device.isOn,
        pin: device.pin
      });
      if (result == null) {
        throw Error('Request Failed');
      }

      commit(types.DEVICE, {
        ...device,
        ...result
      });
    },
    refreshGroups({ commit, dispatch }) {
      this._vm.$feathers
        .service('groups')
        .find()
        .then(deviceGroups => {
          commit(types.DEVICE_GROUP_ID, deviceGroups[0]._id);
          commit(types.DEVICE_GROUPS, deviceGroups);
          dispatch('updateDevices');
        });
    },
    updateDevices({ commit }, groupId) {
      this._vm.$feathers
        .service('devices')
        .find({ query: { groupId } })
        .then(result => {
          commit(
            types.DEVICES,
            result.reduce((obj, item) => {
              item.displayName = item.name;
              item.reqFlag = false;
              obj[item._id] = item;
              return obj;
            }, {})
          );
          commit(types.ONLINE);
        });
    }
  },
  getters: {
    devicesArray(state) {
      return state.devices == null ? null : Object.values(state.devices);
    }
  }
});
