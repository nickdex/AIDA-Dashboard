<template>
  <v-app dark>
    <v-toolbar app text-xs-center>
      <v-toolbar-title>AIDA</v-toolbar-title>
      <v-spacer />
    </v-toolbar>

    <v-content>
      <login></login>
    </v-content>

    <v-footer :fixed="false" app>
      <v-spacer></v-spacer>
      <span>Made with <span style="color:orangered">♥</span> in India</span>
      <v-spacer></v-spacer>
    </v-footer>
  </v-app>
</template>

<script>
import Login from './Login';

export default {
  data: () => ({}),
  components: {
    Login
  }
};
</script>
