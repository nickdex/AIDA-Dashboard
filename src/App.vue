<template>
  <v-app dark>
    <v-toolbar app text-xs-center>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat icon :color="isOnline">
        <v-icon>fas fa-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <v-container v-if="isOnline === 'red'" fluid fill-height>
        <v-layout wrap align-center>
          <v-flex xs12 text-xs-center>
            <v-progress-circular :size="70" :width="7" indeterminate color="red"/>
          </v-flex>
        </v-layout>
      </v-container>
      <Home v-else/>
    </v-content>
    <v-footer :fixed="fixed" app>
      <v-spacer></v-spacer>
      <span>Made with ♥ in India</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
// import offline from 'v-offline';
import Home from './components/Home';

export default {
  computed: {},
  methods: {
    connect(connack) {
      this.isOnline = 'green';
      /* eslint-disable no-console */
      console.log(connack);
    }
  },
  data() {
    return {
      fixed: false,
      title: 'AIDA Dashboard',
      isOnline: 'red'
    };
  },
  created() {
    this.$mqtt.on('connect', this.connect);
  },
  name: 'App',
  components: {
    Home
  }
};
</script>
