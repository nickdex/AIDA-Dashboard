<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center row>
      <v-flex xs12 sm6 md4>
        <v-text-field label="Username" autofocus dark v-model="username" />
        <v-text-field label="Client Name" dark v-model="clientName" />
        <v-select
          label="Client Device Type"
          dark
          :items="deviceTypes"
          v-model="deviceType"
        />
        <v-btn @click="submit">Submit</v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import { ONLINE } from '../mutation-types';

export default {
  data: () => ({
    username: '',
    clientName: '',
    deviceType: '',
    deviceTypes: ['Browser', 'Android', 'iOS']
  }),
  methods: {
    async submit() {
      if (!this.username) {
        console.warn('Username is invalid');
        return;
      }
      if (!this.clientName) {
        console.warn('Client name is invalid');
        return;
      }
      if (!this.deviceType) {
        console.warn('Select a device type');
        return;
      }

      try {
        const result = await this.$feathers.service('clients').create(
          {
            name: this.clientName,
            deviceType: this.deviceType
          },
          { query: { username: this.username } }
        );
        if (result == null) throw new Error('Client could not be created');

        localStorage.setItem('username', this.username);
        localStorage.setItem('clientName', result.name);
        localStorage.setItem('deviceType', result.deviceType);

        this.$store.commit(ONLINE);
        this.$router.replace('/home');
      } catch (error) {
        console.error('Failed to login', error);
      }
    }
  },
  created() {
    if (localStorage.getItem('username')) {
      console.log('we have username');
      this.$router.replace('/home');
    }
  }
};
</script>
