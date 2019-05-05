<template>
  <v-app dark>
    <v-navigation-drawer app v-model="drawer">
      <v-toolbar flat>
        <v-list>
          <v-list-tile>
            <v-list-tile-title class="title" to="route">
              {{ isLoggedIn ? username : title }}
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-divider></v-divider>
      <v-list>
        <v-list-group prepend-icon="fas fa-home" value="true">
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>Dashboard</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile
            v-for="deviceGroup in deviceGroups"
            :key="deviceGroup._id"
            :to="{ name: 'home', params: { id: deviceGroup._id } }"
          >
            <v-list-tile-title v-text="deviceGroup.name"></v-list-tile-title>
          </v-list-tile>
        </v-list-group>

        <v-list-group prepend-icon="fas fa-user-shield" value="false">
          <template v-slot:activator>
            <v-list-tile>
              <v-list-tile-title>Admin</v-list-tile-title>
            </v-list-tile>
          </template>
          <v-list-tile :to="{ name: 'devices' }">
            <v-list-tile-title>IoTDevices</v-list-tile-title>
          </v-list-tile>
          <v-list-tile :to="{ name: 'rooms' }">
            <v-list-tile-title>Rooms</v-list-tile-title>
          </v-list-tile>
          <v-list-tile :to="{ name: 'agents' }">
            <v-list-tile-title>Agents</v-list-tile-title>
          </v-list-tile>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar app text-xs-center>
      <v-btn flat icon @click="drawer = !drawer">
        <v-icon>fas fa-bars</v-icon>
      </v-btn>
      <v-toolbar-title>AIDA</v-toolbar-title>
      <v-spacer />

      <v-btn icon @click="subscribe()">
        <v-icon>fas {{ isSubscribed ? 'fa-bell-slash' : 'fa-bell' }}</v-icon>
      </v-btn>
      <v-btn icon @click="$store.dispatch('updateDevices')">
        <v-icon>fas fa-sync</v-icon>
      </v-btn>
      <v-btn flat icon :color="isOnline ? 'green' : 'red'">
        <v-icon>fas fa-circle</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>

    <v-footer app>
      <v-spacer></v-spacer>
      <span>Made with ♥ in India</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['deviceGroups']),
    isOnline() {
      return this.$store.state.isOnline;
    },
    groupId() {
      return this.$store.state.groupId;
    }
  },
  methods: {
    loggedIn() {
      this.username = localStorage.getItem('username');
      this.isLoggedIn = true;
      this.setSubscriptionState();
    },
    getVapidKey() {
      const vapidPublicKey =
        'BK2ZCisP0bKui7Sxz2H11xHqpKoKO_LkGwptUyxPs9VOjbqm5lRfYvcqSNSo5B8WtfjamAlym5uW89do9JrmHYY';
      const word = vapidPublicKey.length % 4;
      const padding = '='.repeat((4 - word) % 4);
      const base64 = (vapidPublicKey + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
    async setSubscriptionState() {
      try {
        const client = await this.$feathers
          .service('clients')
          .get(localStorage.getItem('clientId'));
        if (client != null) {
          this.isSubscribed = !!client.subscriptionToken;
        }
      } catch (error) {
        console.warn('Backend not available', error);
      }
    },
    sendSubscriptionToServer(subscription) {
      return this.$feathers.service('clients').patch(
        localStorage.getItem('clientName'),
        {
          subscriptionToken: subscription.toJSON()
        },
        { query: { username: this.username } }
      );
    },
    async registerForPush() {
      const swRegistration = await navigator.serviceWorker.ready;
      try {
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.getVapidKey()
        });
        const result = await this.sendSubscriptionToServer(subscription);
        console.log(result.data);
      } catch (error) {
        if (Notification.permission === 'denied') {
          console.warn('Notification is denied');
        } else {
          console.error('Unable to subscribe to push', error);
        }
      }
    },
    async subscribe() {
      if (!this.isLoggedIn) {
        console.warn('Log in first');
        return;
      }
      if (this.isSubscribed) return;

      await this.registerForPush();
      this.isSubscribed = true;
    }
  },
  created() {
    const username = localStorage.getItem('username');
    if (!username) {
      this.isLoggedIn = false;
      return;
    }
    this.username = username;
    this.isLoggedIn = true;
    this.setSubscriptionState();
  },
  data() {
    return {
      title: 'AIDA Dashboard',
      isLoggedIn: false,
      isSubscribed: false,
      username: '',
      drawer: false
    };
  },
  name: 'App'
};
</script>
