<template>
  <v-container fluid fill-height>
    <v-layout column>
      <v-flex>
        <v-select
          :items="deviceGroups"
          :item-text="x => x.name"
          :item-value="x => x._id"
          label="Group"
          v-model="groupId"
        ></v-select>
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
import { DEVICE_GROUP_ID, OFFLINE } from '../mutation-types';

export default {
  computed: {
    ...mapGetters(['devicesArray']),
    ...mapState(['deviceGroups']),
    groupId: {
      get() {
        return this.$store.state.deviceGroupId;
      },
      set(value) {
        this.$store.commit(DEVICE_GROUP_ID, value);
        this.$store.dispatch('updateDevices', value);
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
        this.$store.commit(OFFLINE);
      }
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    isLocal: true,
    _groupId: ''
  }),
  mounted() {
    if (this.$store.groups == null || this.$store.devices == null) {
      this.$store.dispatch('refreshGroups');
    }
  },
  components: {
    Spinner
  }
};
</script>
