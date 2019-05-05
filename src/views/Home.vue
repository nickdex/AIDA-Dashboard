<template>
  <v-container fluid v-if="groupLoading">
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
        <v-container fluid v-else>
          <v-layout row wrap justify-center>
            <v-flex
              xs6
              sm4
              d-flex
              v-for="device in devicesArray"
              :key="device._id"
              class="pa-2"
            >
              <device-button
                @failed="event => showSnackBar('error', event)"
                :device="device"
              ></device-button>
            </v-flex>
          </v-layout>
          <v-snackbar :color="snackColor" v-model="snackbar">
            {{ snackText }}
            <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
          </v-snackbar>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
  </v-tabs>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Spinner from '../components/Spinner';
import DeviceButton from '../components/DeviceButton';
import { DEVICE_GROUP_ID, ROOM_ID } from '../mutation-types';

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
          .catch(error => this.showSnackBar('error', error.message))
          .then(() => {
            this.roomLoading = false;
            this.roomTabIndex = value;
          });
      }
    }
  },
  methods: {
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
        .catch(error => this.showSnackBar('error', error.message))
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
      this.$store
        .dispatch('refreshGroups')
        .catch(error => this.showSnackBar('error', error.message));
    }
  },
  components: {
    Spinner,
    DeviceButton
  }
};
</script>
