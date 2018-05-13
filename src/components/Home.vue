<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <v-flex xs12 sm4 md4 v-for="device in devices" :key="device.id" text-xs-center>
          <v-btn @click.native="toggleState(device)" large :color="colorStyle(device.isOn)">{{ device.name }}
              <v-icon right>fas {{ iconStyle(device.isOn) }}</v-icon>
          </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  methods: {
    colorStyle: isOn => (isOn ? 'success' : 'error'),
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off'),
    toggleState(device) {
      const payload = {
        device: device.id,
        action: device.isOn ? 'off' : 'on',
        sender: 'server'
      };
      this.$mqtt.publish(process.env.SERVER_TOPIC, JSON.stringify(payload));

      this.devices.find(d => d.id === device.id).reqFlag = true;
    }
  },
  mqtt: {
    arduino(data) {
      if (JSON.parse(data).message === 'done') {
        const device = this.devices.find(d => d.reqFlag === true);
        device.isOn = !device.isOn;
        device.reqFlag = false;
      } // else console.error('Request failed');
    }
  },
  data: () => ({
    devices: [
      {
        id: 4,
        isOn: false,
        name: 'Fan',
        reqFlag: false
      },
      {
        id: 2,
        isOn: false,
        name: 'Room Lights',
        reqFlag: false
      },
      {
        id: 5,
        isOn: false,
        name: 'Outdoor Lights',
        reqFlag: false
      }
    ]
  }),
  created() {
    this.$mqtt.subscribe(process.env.IOT_TOPIC);
  },
  props: {
    source: String
  }
};
</script>
