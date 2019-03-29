<template>
  <v-container>
    <v-layout>
      <v-expansion-panel popout>
        <v-expansion-panel-content>
          <template v-slot:header>
            <div>IotDevice</div>
          </template>
          <v-card> </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      entities: [
        'DeviceGroups',
        'Rooms',
        'Agents',
        'Users',
        'Clients',
        'IotDevices'
      ]
    };
  }
};
</script>

<style></style>
