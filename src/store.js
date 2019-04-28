import Vue from 'vue';
import Vuex from 'vuex';
import lodash from 'lodash';

import * as types from './mutation-types';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isOnline: false,
    deviceGroups: [],
    deviceGroupId: '',
    devices: [],
    rooms: [],
    agents: [],
    roomId: ''
  },
  mutations: {
    [types.ONLINE]: state => (state.isOnline = true),
    [types.OFFLINE]: state => (state.isOnline = false),
    [types.DEVICE]: (state, device) =>
      (state.devices = { ...state.devices, [device._id]: device }),
    [types.DEVICES]: (state, devices) => (state.devices = devices),
    [types.ROOMS]: (state, rooms) => (state.rooms = rooms),
    [types.ROOM_ID]: (state, roomId) => (state.roomId = roomId),
    [types.DEVICE_GROUPS]: (state, deviceGroups) =>
      (state.deviceGroups = deviceGroups),
    [types.DEVICE_GROUP_ID]: (state, deviceGroupId) =>
      (state.deviceGroupId = deviceGroupId),
    [types.AGENTS]: (state, agents) => (state.agents = agents)
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
        isOn: !device.isOn
      });
      if (result == null) {
        throw Error('Request Failed');
      }

      commit(types.DEVICE, {
        ...device,
        ...result
      });
    },
    refreshGroups({ commit, dispatch, state }) {
      return this._vm.$feathers
        .service('groups')
        .find()
        .then(deviceGroups => {
          if (!state.deviceGroupId)
            commit(types.DEVICE_GROUP_ID, lodash.first(deviceGroups)._id);

          commit(types.DEVICE_GROUPS, deviceGroups);
          return dispatch('updateRooms');
        });
    },
    updateRooms({ commit, dispatch, state }) {
      const deviceGroupId = state.deviceGroupId;
      return this._vm.$feathers
        .service('rooms')
        .find({ query: { deviceGroupId } })
        .then(rooms => {
          commit(types.ROOM_ID, rooms[0]._id);
          commit(types.ROOMS, rooms);
          return dispatch('updateAgents');
        });
    },
    createRoom({ state }, room) {
      const deviceGroupId = state.deviceGroupId;
      return this._vm.$feathers
        .service('rooms')
        .create({ ...room }, { query: { deviceGroupId } })
        .catch(err => console.error(err))
        .then(() => this.dispatch('updateRooms'));
    },
    createAgent(_, agent) {
      const roomId = agent.roomId;
      return this._vm.$feathers
        .service('agents')
        .create({ ...agent }, { query: { roomId } })
        .catch(err => console.error(err))
        .then(() => this.dispatch('updateAgents'));
    },
    updateAgents({ commit, state, dispatch }) {
      const roomId = state.roomId;
      return this._vm.$feathers
        .service('agents')
        .find({ query: { roomId } })
        .then(agents => {
          commit(types.AGENTS, agents);

          return dispatch('updateDevices');
        });
    },
    updateDevices({ commit, state }) {
      const agentIds = lodash.map(state.agents, '_id');
      return this._vm.$feathers
        .service('devices')
        .find({ query: { agentId: { $in: agentIds } } })
        .then(devices => {
          return devices.filter(d => agentIds.includes(d.agentId));
        })
        .then(devices => {
          return devices.reduce((obj, item) => {
            item.displayName = item.name;
            item.reqFlag = false;
            obj[item._id] = item;
            return obj;
          }, {});
        })
        .then(devices => {
          commit(types.ONLINE);
          commit(types.DEVICES, devices);
        });
    }
  },
  getters: {
    devicesArray(state) {
      return state.devices == null ? null : Object.values(state.devices);
    },
    deviceGroupIds: state => lodash.map(state.deviceGroups, '_id'),
    rooms: state => state.rooms,
    agents: state => state.agents
  }
});
