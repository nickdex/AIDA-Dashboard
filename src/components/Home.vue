<template>
  <v-container fluid fill-height>
    <v-layout wrap align-center>
      <v-flex xs12 sm4 md4 v-for="device in devices" :key="device._id" text-xs-center>
          <v-btn large :color="colorStyle(device.isOn)">{{ device.name }}
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
    iconStyle: isOn => (isOn ? 'fa-toggle-on' : 'fa-toggle-off')
  },
  data: () => ({
    devices: [
      {
        _id: 4,
        isOn: false,
        name: 'Fan',
        req_flag: false
      },
      {
        _id: 2,
        isOn: false,
        name: 'Room Lights',
        req_flag: false
      },
      {
        _id: 5,
        isOn: false,
        name: 'Outdoor Lights',
        req_flag: false
      }
    ]
  }),
  props: {
    source: String
  }
};
</script>
