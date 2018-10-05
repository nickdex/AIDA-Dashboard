<template>
    <v-container fluid fill-height>
        <v-layout align-center justify-center row>
            <v-flex xs12 sm6 md4>
                <v-text-field label="Username" autofocus dark v-model="username" />
                <v-text-field label="Client Name"  dark v-model="clientName" />
                <v-select label="Client Device Type" dark :items="deviceTypes" v-model="deviceType"/>
                <v-btn @click="submit">Submit</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
import { httpClient } from '../http';

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
        const result = await httpClient.post(
          `/clients?username=${this.username}`,
          {
            name: this.clientName,
            deviceType: this.deviceType
          }
        );

        if (result.status !== 201) console.error(result.statusText);

        localStorage.setItem('username', this.username);
        localStorage.setItem('clientName', this.clientName);
        localStorage.setItem('deviceType', this.deviceType);

        this.$store.commit('online');
        this.$router.push('/home');
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
