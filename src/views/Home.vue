<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <v-flex
        xs12
        sm4
        md4
        v-for="device in getDevicesArray"
        :key="device.pin"
        text-xs-center
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
  </v-container>
</template>

<script>
import Spinner from '../components/Spinner';

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
      try {
        this.devices[device.pin].reqFlag = true;
        const result = await this.$feathers
          .service('devices')
          .patch(device.name, {
            isOn: !device.isOn,
            pin: device.pin
          });

        if (result != null) {
          this.$store.commit('online');
          console.log(result);
          const resultDevice = result;
          const toggleDevice = this.devices[resultDevice.pin];
          toggleDevice.isOn = resultDevice.isOn;
          toggleDevice.reqFlag = false;
        } else throw Error('Request Failed');
      } catch (error) {
        this.devices[device.pin].reqFlag = false;
        this.showSnackBar('error', error.message);
        this.$store.commit('offline');
      }
    },
    showSnackBar(color, text) {
      this.snackbar = true;
      this.snackColor = color;
      this.snackText = text;
    },
    refreshValues() {
      this.$feathers
        .service('devices')
        .find()
        .then(result => {
          result.forEach(serverDevice => {
            const localDevice = this.devices[serverDevice.pin];
            localDevice.isOn = serverDevice.isOn;
            localDevice.name = serverDevice.name;
            localDevice.room = serverDevice.room;
          });
          this.$store.commit('online');
        });
    }
  },
  data: () => ({
    snackbar: false,
    snackColor: 'success',
    snackText: '',
    isLocal: true,
    devices: {
      4: {
        pin: 4,
        name: 'fan',
        isOn: false,
        displayName: 'Fan',
        reqFlag: false
      },
      2: {
        pin: 2,
        name: 'lights',
        isOn: false,
        displayName: 'Room Lights',
        reqFlag: false
      },
      5: {
        pin: 5,
        name: 'outdoor',
        isOn: false,
        displayName: 'Outdoor Lights',
        reqFlag: false
      }
    }
  }),
  created() {
    this.refreshValues();
  },
  components: {
    Spinner
  }
};
</script>
