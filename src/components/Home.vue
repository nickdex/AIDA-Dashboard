<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <v-flex xs12 sm4 md4 v-for="device in getDevicesArray" :key="device.id" text-xs-center>
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
import { httpClient } from '../http';
import Spinner from './Spinner';

export default {
  computed: {
    getDevicesArray() {
      return Object.values(this.devices);
    }
  },
  methods: {
    colorStyle: isOn => (isOn ? 'success' : 'error'),
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off'),
    async toggleState(device) {
      const payload = {
        device: device.id,
        action: device.isOn ? 'off' : 'on',
        sender: 'server'
      };

      const toggleDevice = this.devices[device.id];
      toggleDevice.reqFlag = true;

      httpClient
        .post('/web', payload, { timeout: 5000 })
        .then(result => {
          if (result.data === 'done') {
            toggleDevice.isOn = !toggleDevice.isOn;
            toggleDevice.reqFlag = false;
          } else throw Error('Local Request Failed');
        })
        .catch(() => {
          this.showSnackBar('info', 'Local not available. Switching to Web');
          this.isLocal = false; // Start receiving messages from mqtt directly

          this.$mqtt.publish(process.env.SERVER_TOPIC, JSON.stringify(payload));
        });
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    },
    connected(connack) {
      /* eslint-disable no-console */
      console.log(connack);
      this.$emit('loaded');
    },
    disconnected() {
      this.$emit('lost');
    },
    refreshValues() {
      httpClient.get('/devices').then(result => {
        result.data.forEach(serverDevice => {
          const localDevice = this.devices[serverDevice.id];
          localDevice.isOn = serverDevice.isOn;
          localDevice.name = serverDevice.name;
        });
      });
    }
  },
  mqtt: {
    arduino(data) {
      if (!this.isLocal) {
        if (JSON.parse(data).message === 'done') {
          let device = this.getDevicesArray.find(d => d.reqFlag === true);
          if (device) {
            device = this.devices[device.id];
            device.isOn = !device.isOn;
            device.reqFlag = false;
          }
        } else this.showSnackBar('error', 'Request Failed');
        this.isLocal = true;
      }
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    isLocal: true,
    devices: {
      4: {
        id: 4,
        key: 'fan',
        token: '35e9799e',
        isOn: false,
        name: 'Fan',
        reqFlag: false
      },
      2: {
        id: 2,
        key: 'light',
        token: 'cac5317f',
        isOn: false,
        name: 'Room Lights',
        reqFlag: false
      },
      5: {
        id: 5,
        isOn: false,
        key: 'outdoor',
        token: '6d82c9a6',
        name: 'Outdoor Lights',
        reqFlag: false
      }
    }
  }),
  created() {
    this.$mqtt.on('connect', this.connected);
    this.$mqtt.on('reconnect', this.connected);
    this.$mqtt.on('close', this.disconnected);
    this.$mqtt.on('offline', this.disconnected);
    this.$mqtt.subscribe(process.env.IOT_TOPIC);
    this.refreshValues();
  },
  components: {
    Spinner
  }
};
</script>
