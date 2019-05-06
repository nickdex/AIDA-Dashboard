<template>
  <v-tabs
    color="grey darken-4"
    fixed-tabs
    dark
    show-arrows
    v-model="selectedRoom"
  >
    <v-tab v-for="(room, roomIdx) in rooms" :key="roomIdx">
      {{ room.name }}
    </v-tab>

    <v-tabs-slider color="yellow"></v-tabs-slider>
  </v-tabs>
</template>

<script>
import { mapState } from 'vuex';

import { ROOM_ID, IS_ROOM_LOADING } from '../mutation-types';

export default {
  computed: {
    ...mapState(['rooms']),
    selectedRoom: {
      get() {
        return this.roomTabIndex;
      },
      set(value) {
        if (value == undefined) return;

        this.$store.commit(ROOM_ID, this.rooms[value]._id);
        this.$store.commit(IS_ROOM_LOADING, true);
        this.$store
          .dispatch('updateAgents')
          .catch(error => console.error(error.message))
          .then(() => {
            this.roomTabIndex = value;
            this.$store.commit(IS_ROOM_LOADING, false);
          });
      }
    }
  },
  data: () => ({
    roomTabIndex: 0
  })
};
</script>

<style></style>
