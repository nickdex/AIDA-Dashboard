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
import lodash from 'lodash';

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
      const deviceType = lodash.toUpper(this.deviceType);

      try {
        const clients = await this.$feathers.service('clients').find({
          query: {
            userId: this.username,
            name: this.clientName,
            deviceType
          }
        });
        let client = lodash.first(clients);

        const clientId = client._id;

        if (!client) {
          client = await this.$feathers.service('clients').create(
            {
              name: this.clientName,
              deviceType
            },
            { query: { username: this.username } }
          );

          if (client == undefined)
            throw new Error('Client could not be created');
        } else {
          client = await this.$feathers.service('clients').get(clientId);
        }

        localStorage.setItem('username', this.username);
        localStorage.setItem('clientId', client._id);
        localStorage.setItem('clientName', client.name);
        localStorage.setItem('deviceType', client.deviceType);

        this.$store.commit(ONLINE);

        await this.$store.dispatch('refreshGroups');
        const deviceGroupId = lodash.first(this.$store.getters.deviceGroupIds);
        localStorage.setItem('defaultDeviceGroupId', deviceGroupId);
        this.$router.replace(`/home/${deviceGroupId}`);
      } catch (error) {
        console.error('Failed to login', error);
      }
    }
  }
};
</script>
