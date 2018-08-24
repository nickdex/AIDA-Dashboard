<template>
  <v-app dark>
    <v-toolbar app text-xs-center>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat icon @click="refresh()">
        <v-icon>fas fa-sync</v-icon>
      </v-btn>
      <v-btn flat icon :color="isOnline?'green':'red'">
        <v-icon>fas fa-circle</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <Home ref="home" @loaded="online()" @lost="offline()"/>
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
    }
  },
  data() {
    return {
      fixed: false,
      title: 'AIDA Dashboard',
      isOnline: false
    };
  },
  name: 'App',
  components: {
    Home
  }
};
</script>
