<template>
  <v-container>
    <v-layout>
      <v-expansion-panel popout>
        <v-expansion-panel-content>
          <template v-slot:header>
            <div>IotDevice</div>
          </template>
          <v-card>
            <iot-device />
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-layout>
  </v-container>
</template>

<script>
import IotDevice from '../components/IotDevice';

export default {
  components: {
    IotDevice
  },
  data() {
    return {
      entities: [
        'DeviceGroups',
        'Rooms',
        'Agents',
        'Users',
        'Clients',
        'IotDevices'
      ]
    };
  }
};
</script>

<style></style>
