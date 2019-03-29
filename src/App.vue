<template>
  <v-app dark>
    <v-toolbar app text-xs-center>
      <v-toolbar-title v-text="isLoggedIn ? username : title" />
      <v-spacer />
      <v-btn flat icon @click="subscribe()">
        <v-icon>fas {{ isSubscribed ? 'fa-bell-slash' : 'fa-bell' }}</v-icon>
      </v-btn>
      <v-btn flat icon @click="$store.dispatch('refreshGroups')">
        <v-icon>fas fa-sync</v-icon>
      </v-btn>
      <v-btn flat icon :color="isOnline ? 'green' : 'red'">
        <v-icon>fas fa-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-footer :fixed="fixed" app>
      <v-spacer></v-spacer>
      <span>Made with ♥ in India</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  computed: {
    isOnline() {
      return this.$store.state.isOnline;
    },
    groupId() {
      return this.$store.state.groupId;
    }
  },
  methods: {
    loggedIn() {
      this.username = localStorage.getItem(this.usernameKey);
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
      isLoggedIn: false,
      isSubscribed: false,
      username: '',
      usernameKey: 'username'
    };
  },
  name: 'App',
};
</script>
