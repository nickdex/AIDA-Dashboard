<template>
  <div>
    <v-container v-if="groupLoading">
      <v-layout>
        <v-flex d-flex>
          <spinner />
        </v-flex>
      </v-layout>
    </v-container>
    <v-tabs v-else fixed-tabs dark show-arrows v-model="selectedRoom">
      <v-tab v-for="(room, roomIdx) in rooms" :key="roomIdx">
        {{ room.name }}
      </v-tab>

      <v-tabs-slider color="yellow"></v-tabs-slider>
      <v-tabs-items>
        <v-tab-item v-for="(room, roomIdx) in rooms" :key="roomIdx">
          <v-container v-if="roomLoading">
            <v-layout>
              <v-flex d-flex>
                <spinner />
              </v-flex>
            </v-layout>
          </v-container>
          <v-container v-else>
            <v-layout column>
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
                      :groupLoading="device.reqFlag"
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
                  <v-btn dark flat @click.native="snackbar = false"
                    >Close</v-btn
                  >
                </v-snackbar>
              </v-flex>
            </v-layout>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Spinner from '../components/Spinner';
import { DEVICE_GROUP_ID, OFFLINE, ROOM_ID } from '../mutation-types';

export default {
  computed: {
    ...mapGetters(['devicesArray']),
    ...mapState(['rooms']),
    selectedRoom: {
      get() {
        return this.roomTabIndex;
      },
      set(value) {
        this.roomLoading = true;
        this.$store.commit(ROOM_ID, this.rooms[value]._id);
        this.$store
          .dispatch('updateAgents')
          .catch(err => console.error(err))
          .then(() => {
            this.roomLoading = false;
            this.roomTabIndex = value;
          });
      }
    }
  },
  methods: {
    colorStyle: isOn => (isOn ? 'success' : 'error'),
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off'),
    async toggleState(device) {
      this.$store.dispatch('toggleDevicegroupLoading', device._id);
      try {
        await this.$store.dispatch('updateDevice', { device });
      } catch (error) {
        this.showSnackBar('error', error.message);
        this.$store.dispatch('toggleDevicegroupLoading', device._id);
        this.$store.commit(OFFLINE);
      }
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    },
    updateDeviceGroup(deviceId) {
      localStorage.setItem('defaultDeviceGroupId', deviceId);
      this.$store.commit(DEVICE_GROUP_ID, deviceId);
      this.$store
        .dispatch('updateRooms')
        .catch(err => console.error(err))
        .then(() => {
          this.groupLoading = false;
          this.roomLoading = false;
        });
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    roomTabIndex: 0,
    groupLoading: true,
    roomLoading: true
  }),
  beforeRouteUpdate(to, from, next) {
    this.updateDeviceGroup(to.params.id);
    this.groupLoading = true;

    next();
  },
  mounted() {
    let deviceGroupId =
      this.$route.params.id || localStorage.getItem('defaultDeviceGroupId');

    if (deviceGroupId) {
      this.updateDeviceGroup(deviceGroupId);
    }

    // On App load
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
