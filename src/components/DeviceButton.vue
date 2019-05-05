<template>
  <v-card
    v-ripple
    @click="toggleState()"
    class="raised"
    :color="device.isOn ? 'success' : 'error'"
  >
    <v-layout column align-center>
      <v-flex xs12>
        <v-card-title class="text-uppercase text-xs-center font-weight-bold">
          {{ device.displayName }}
        </v-card-title>
      </v-flex>
      <v-card-actions class="pa-3">
        <v-progress-circular v-if="device.reqFlag" indeterminate />

        <v-icon size="32" v-else>
          fas {{ device.isOn ? 'fa-toggle-on' : 'fa-toggle-off' }}
        </v-icon>
      </v-card-actions>
    </v-layout>
  </v-card>
</template>

<script>
import { OFFLINE } from '../mutation-types';
export default {
  props: ['device'],
  methods: {
    async toggleState() {
      const device = this.device;
      this.$store.dispatch('toggleDeviceLoading', device._id);
      try {
        await this.$store.dispatch('updateDevice', { device });
      } catch (error) {
        this.$emit('failed', error.message);

        this.$store.dispatch('toggleDeviceLoading', device._id);
        this.$store.commit(OFFLINE);
      }
    }
  }
};
</script>

<style>
.raised:active {
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
    0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}
</style>
