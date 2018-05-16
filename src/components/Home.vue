<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <Spinner v-if="!isOnline" />
      <v-flex v-else xs12 sm4 md4 v-for="device in devices" :key="device.id" text-xs-center>
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
import { kvHttp, all, spread } from '../http';
import Spinner from './Spinner';

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
      const res = await kvHttp.post(
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
    },
    connect(connack) {
      this.isMqttConnected = true;
      this.isOnline = this.isMqttConnected && this.areDevicesLoaded;
      /* eslint-disable no-console */
      console.log(connack);
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
    isMqttConnected: false,
    areDevicesLoaded: false,
    isOnline: false,
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
    this.$mqtt.on('connect', this.connect);
    this.$mqtt.subscribe(process.env.IOT_TOPIC);
    const requests = [];
    for (let index = 0; index < this.devices.length; index += 1) {
      const device = this.devices[index];
      requests.push(kvHttp.get(`${device.token}/${device.key}`));
    }

    all(requests).then(
      spread((first, second, third) => {
        const results = [first, second, third];
        results.forEach((result) => {
          this.devices.find(d => result.request.responseURL.includes(d.token)).isOn = result.data;
        });

        this.areDevicesLoaded = true;
        this.isOnline = this.isMqttConnected && this.areDevicesLoaded;
        this.$emit('loaded');
      })
    );
  },
  components: {
    Spinner
  }
};
</script>
