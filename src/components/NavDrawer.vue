<template>
  <v-navigation-drawer app :value="drawer" @input="$emit('change', $event)">
    <v-toolbar flat>
      <v-list>
        <v-list-tile>
          <v-list-tile-title class="title" to="route">
            {{ title }}
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
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: { ...mapState(['deviceGroups']) },
  model: { prop: 'drawer', event: 'change' },
  props: ['drawer', 'title']
};
</script>

<style></style>
