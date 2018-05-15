<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <v-flex xs12 sm4 md4 v-for="device in devices" :key="device.id" text-xs-center>
          <v-btn :loading="device.reqFlag" @click.native="toggleState(device)" large :color="colorStyle(device.isOn)">{{ device.name }}
              <v-icon right>fas {{ iconStyle(device.isOn) }}</v-icon>
          </v-btn>
      </v-flex>
    </v-layout>
    <v-snackbar :color="snackColor" v-model="snackbar">
      {{ snackText }}
    <v-btn dark flat @click.native="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from '../http';

export default {
  methods: {
    colorStyle: isOn => (isOn ? 'success' : 'error'),
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off'),
    async toggleState(device) {
      const payload = {
        device: device.id,
        action: device.isOn ? 'off' : 'on',
        sender: 'server'
      };
      const res = await axios.post(
        `${device.token}/${device.key}/${!device.isOn}`
      );
      if (res.status === 200) {
        this.$mqtt.publish(process.env.SERVER_TOPIC, JSON.stringify(payload));
        this.devices.find(d => d.id === device.id).reqFlag = true;
      } else this.showSnackBar();
    },
    updateDevice(res, key) {
      /* eslint-disable no-console */
      console.log(res);
      this.devices.find(d => d.key === key).isOn = res.data;
    },
    showSnackBar() {
      this.snackbar = true;
      this.snackbar = 'error';
      this.snackText = 'Request Failed';
    }
  },
  mqtt: {
    arduino(data) {
      if (JSON.parse(data).message === 'done') {
        const device = this.devices.find(d => d.reqFlag === true);
        device.isOn = !device.isOn;
        device.reqFlag = false;
      } else this.showSnackBar();
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    devices: [
      {
        id: 4,
        key: 'fan',
        token: '35e9799e',
        isOn: false,
        name: 'Fan',
        reqFlag: false
      },
      {
        id: 2,
        key: 'light',
        token: 'cac5317f',
        isOn: false,
        name: 'Room Lights',
        reqFlag: false
      },
      {
        id: 5,
        isOn: false,
        key: 'outdoor',
        token: '869c5aa9',
        name: 'Outdoor Lights',
        reqFlag: false
      }
    ]
  }),
  created() {
    this.$mqtt.subscribe(process.env.IOT_TOPIC);
    for (let index = 0; index < this.devices.length; index += 1) {
      const device = this.devices[index];
      axios
        .get(`${device.token}/${device.key}`)
        .then(res => this.updateDevice(res, device.key));
    }
  }
};
</script>
