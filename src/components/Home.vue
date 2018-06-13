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
import { piHttp, kvHttp, all, spread } from '../http';
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
        const toggleDevice = this.devices.find(d => d.id === device.id);
        toggleDevice.reqFlag = true;

        piHttp.post('/web', payload, { timeout: 5000 }).then(
          result => {
            if (result.data === 'done') {
              toggleDevice.isOn = !toggleDevice.isOn;
              toggleDevice.reqFlag = false;
            } else throw Error('Local Request Failed');
          },
          () => {
            this.showSnackBar('info', 'Local not available. Switching to Web');
            this.isLocal = false; // Start receiving messages from mqtt directly

            this.$mqtt.publish(
              process.env.SERVER_TOPIC,
              JSON.stringify(payload)
            );
          }
        );
      } else this.showSnackBar('error', 'Device state could not be loaded');
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    },
    connect(connack) {
      this.isMqttConnected = true;
      /* eslint-disable no-console */
      console.log(connack);
      this.$emit('loaded');
    }
  },
  mqtt: {
    arduino(data) {
      if (!this.isLocal) {
        if (JSON.parse(data).message === 'done') {
          const device = this.devices.find(d => d.reqFlag === true);
          if (device) {
            device.isOn = !device.isOn;
            device.reqFlag = false;
          }
        } else this.showSnackBar('error', 'Request Failed');
      }
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    isMqttConnected: false,
    isLocal: true,
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
        token: '6d82c9a6',
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
        results.forEach(result => {
          this.devices.find(d =>
            result.request.responseURL.includes(d.token)
          ).isOn =
            result.data;
        });

        this.isOnline = true;
      })
    );
  },
  components: {
    Spinner
  }
};
</script>
