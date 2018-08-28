<template>
  <v-app dark>
    <v-toolbar app text-xs-center>
      <v-toolbar-title v-text="isLoggedIn ? username : title" />
      <v-spacer />
      <v-btn flat icon @click="subscribe()">
        <v-icon>fas {{isSubscribed ? 'fa-bell-slash' : 'fa-bell'}}</v-icon>
      </v-btn>
      <v-btn flat icon @click="refresh()">
        <v-icon>fas fa-sync</v-icon>
      </v-btn>
      <v-btn flat icon :color="isOnline?'green':'red'">
        <v-icon>fas fa-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <Login v-if="!isLoggedIn" @login="loggedIn" />
      <Home v-else ref="home" @loaded="online" @lost="offline"/>
    </v-content>
    <v-footer :fixed="fixed" app>
      <v-spacer></v-spacer>
      <span>Made with ♥ in India</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import Home from './components/Home';
import Login from './components/Login';
import { httpClient } from './http';

export default {
  methods: {
    online() {
      this.isOnline = true;
    },
    offline() {
      this.isOnline = false;
    },
    refresh() {
      this.$refs.home.refreshValues();
    },
    loggedIn(username) {
      if (username === '' || username == null) {
        this.loggedIn = false;
        console.warn('Username is invalid');
        return;
      }
      this.username = username;
      localStorage.setItem(this.usernameKey, username);
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
        const result = await httpClient.get(`/push/${this.username}`);
        if (result && result.data) {
          this.isSubscribed = result.data.isSubscribed;
        }
      } catch (error) {
        console.warn('Backend not available', error);
      }
    },
    sendSubscriptionToServer(subscription) {
      return httpClient.post('/push', {
        subscription: subscription.toJSON(),
        name: this.username
      });
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
    const username = localStorage.getItem(this.usernameKey);
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
      fixed: false,
      title: 'AIDA Dashboard',
      isOnline: false,
      isLoggedIn: false,
      isSubscribed: false,
      username: '',
      usernameKey: 'username'
    };
  },
  name: 'App',
  components: {
    Login,
    Home
  }
};
</script>
