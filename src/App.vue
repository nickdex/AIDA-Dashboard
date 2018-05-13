<template>
  <v-app dark>
    <v-toolbar app>
      <v-spacer></v-spacer>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-content>
      <Home/>
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
  data() {
    return {
      fixed: false,
      title: 'AIDA Dashboard'
    };
  },
  name: 'App',
  components: {
    Home
  }
};
</script>
