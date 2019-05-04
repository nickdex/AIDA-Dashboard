<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>IotDevices</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">New Device</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="editedItem.name"
                    label="Device Name"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="editedItem.pin"
                    label="Pin"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-select
                    :items="agentIds"
                    label="Agent Ids"
                    v-model="editedItem.agentId"
                  ></v-select>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="editedItem.agentId"
                    label="Agent Id"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table dense :headers="headers" :items="devices" class="elevation-1">
      <template v-slot:items="props">
        <td>{{ props.item._id | parentId }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.pin }}</td>
        <td class="column text-xs-left">
          <v-icon small class="mr-2" @click="editItem(props.item)">
            fas fa-edit
          </v-icon>
          <v-icon small @click="deleteItem(props.item)">fas fa-trash</v-icon>
        </td>
      </template>
      <template v-slot:no-data>
        <v-btn color="primary" click>Reset</v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({ devices: 'devicesArray', agentIds: 'agentIds' }),
    formTitle() {
      return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
    }
  },
  filters: {
    parentId(id) {
      return id
        .split('-')
        .slice(-2)
        .reverse()
        .pop();
    }
  },
  watch: {
    dialog(val) {
      val || this.close();
    }
  },
  methods: {
    editItem(item) {
      this.editedIndex = this.devices.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.devices.indexOf(item);
      confirm('Are you sure you want to delete this item?') &&
        this.devices.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      const iotDevice = {
        _id: this.editedItem._id,
        name: this.editedItem.name,
        pin: this.editedItem.pin,
        agentId: this.editedItem.agentId
      };
      if (this.editedIndex > -1) {
        Object.assign(this.devices[this.editedIndex], this.editedItem);
        this.$store.dispatch('updateItem', {
          serviceName: 'devices',
          item: iotDevice
        });
      } else {
        this.$store.dispatch('createDevice', iotDevice);
      }
      this.close();
    }
  },
  data() {
    return {
      dialog: false,
      valid: false,
      name: '',
      pin: 0,
      editedIndex: -1,
      defaultItem: {
        _id: '',
        name: '',
        pin: 0,
        agentId: ''
      },
      editedItem: {
        _id: '',
        name: '',
        pin: 0,
        agentId: ''
      },
      headers: [
        { text: 'Agent Id', value: '_id' },
        { text: 'Name', value: 'name' },
        { text: 'Pin', value: 'pin' },
        { text: 'Actions', value: 'name', sortable: false }
      ]
    };
  }
};
</script>
