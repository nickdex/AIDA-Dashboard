<template>
  <v-app dark>
    <nav-drawer v-model="drawer" :title="username" />

    <v-toolbar app text-xs-center>
      <v-btn flat icon @click="drawer = !drawer">
        <v-icon>fas fa-bars</v-icon>
      </v-btn>
      <v-toolbar-title>AIDA Admin</v-toolbar-title>
      <v-spacer />
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
import NavDrawer from '../components/NavDrawer';

export default {
  components: { NavDrawer },
  data: () => ({
    username: localStorage.getItem('username'),
    drawer: false
  })
};
</script>
