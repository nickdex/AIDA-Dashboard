<template>
  <v-container fluid fill-height>
    <v-layout row align-center v-if="isRoomLoading">
      <v-flex d-flex>
        <spinner />
      </v-flex>
    </v-layout>
    <v-layout row align-center v-else>
      <v-flex d-flex>
        <v-tabs-items>
          <v-tab-item v-for="(room, roomIdx) in rooms" :key="roomIdx">
            <v-layout row wrap justify-center>
              <v-flex
                xs6
                sm4
                lg2
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
          </v-tab-item>
        </v-tabs-items>
      </v-flex>
    </v-layout>
    <v-snackbar :color="snackColor" v-model="snackbar">
      {{ snackText }}
      <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Spinner from '../components/Spinner';
import DeviceButton from '../components/DeviceButton';
import { DEVICE_GROUP_ID, IS_ROOM_LOADING } from '../mutation-types';

export default {
  computed: {
    ...mapGetters(['devicesArray']),
    ...mapState(['rooms', 'isRoomLoading'])
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
          this.$store.commit(IS_ROOM_LOADING, false);
        });
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: ''
  }),
  beforeRouteUpdate(to, from, next) {
    this.updateDeviceGroup(to.params.id);
    this.$store.commit(IS_ROOM_LOADING, true);
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
