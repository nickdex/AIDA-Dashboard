<template>
  <v-container fluid fill-height>
    <v-layout column>
      <v-flex>
        <v-layout row wrap justify-space-around>
          <v-flex d-flex mx-2>
            <v-select
              :items="rooms"
              :item-text="x => x.name"
              :item-value="x => x._id"
              label="Room"
              v-model="roomId"
            ></v-select>
          </v-flex>
        </v-layout>
      </v-flex>

      <v-flex d-flex>
        <v-layout wrap justify-center>
          <v-flex
            xs8
            d-flex
            sm4
            v-for="device in devicesArray"
            :key="device._id"
          >
            <v-btn
              :loading="device.reqFlag"
              @click.native="toggleState(device)"
              large
              :color="colorStyle(device.isOn)"
            >
              {{ device.displayName }}
              <v-icon right>fas {{ iconStyle(device.isOn) }}</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-snackbar :color="snackColor" v-model="snackbar">
          {{ snackText }}
          <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
        </v-snackbar>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Spinner from '../components/Spinner';
import { DEVICE_GROUP_ID, OFFLINE, ROOM_ID } from '../mutation-types';

export default {
  computed: {
    ...mapGetters(['devicesArray']),
    ...mapState(['deviceGroups', 'rooms']),
    groupId: {
      get() {
        return this.$store.state.deviceGroupId;
      },
      set(value) {
        this.$store.commit(DEVICE_GROUP_ID, value);
        this.$store.dispatch('updateRooms');
      }
    },
    roomId: {
      get() {
        return this.$store.state.roomId;
      },
      set(value) {
        this.$store.commit(ROOM_ID, value);
        this.$store.dispatch('updateDevices');
      }
    }
  },
  methods: {
    colorStyle: isOn => (isOn ? 'success' : 'error'),
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off'),
    async toggleState(device) {
      this.$store.dispatch('toggleDeviceLoading', device._id);
      try {
        await this.$store.dispatch('updateDevice', { device });
      } catch (error) {
        this.showSnackBar('error', error.message);
        this.$store.dispatch('toggleDeviceLoading', device._id);
        this.$store.commit(OFFLINE);
      }
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    },
    updateDeviceGroup(deviceId) {
      this.$store.commit(DEVICE_GROUP_ID, deviceId);
      this.$store.dispatch('updateRooms');
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    isLocal: true,
    _groupId: ''
  }),

  beforeRouteUpdate(to, from, next) {
    this.updateDeviceGroup(to.params.id);
    next();
  },
  mounted() {
    let deviceGroupId = localStorage.getItem('defaultDeviceGroupId');
    if (deviceGroupId) {
      this.updateDeviceGroup(deviceGroupId);
    }
    if (
      !this.$store.getters.deviceGroupIds ||
      this.$store.getters.deviceGroupIds.length == 0
    ) {
      this.$store.dispatch('refreshGroups').catch(err => console.error(err));
    }
  },
  components: {
    Spinner
  }
};
</script>
