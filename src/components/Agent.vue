<template>
  <v-card>
    <v-toolbar flat>
      <v-toolbar-title>Iot Agents</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <template v-slot:activator="{ on }">
          <v-btn color="primary" dark class="mb-2" v-on="on">New Agent</v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md4>
                  <v-text-field
                    v-model="editedItem.site"
                    label="Agent Site"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md4>
                  <v-text-field
                    v-model="editedItem.roomId"
                    label="Room Id"
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
    <v-data-table dense :headers="headers" :items="agents" class="elevation-1">
      <template v-slot:items="props">
        <td>{{ props.item._id | parentId }}</td>
        <td>{{ props.item.site }}</td>
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
    rooms() {
      return mapGetters(['rooms']);
    },
    agents() {
      return this.$store.getters['agents'];
    },
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
      this.editedIndex = this.agents.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.agents.indexOf(item);
      confirm('Are you sure you want to delete this item?') &&
        this.agents.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.agents[this.editedIndex], this.editedItem);
      } else {
        const agent = {
          _id: this.editedItem._id,
          site: this.editedItem.site,
          roomId: this.editedItem.roomId
        };
        this.$store.dispatch('createAgent', agent);
      }
      this.close();
    }
  },
  data() {
    return {
      dialog: false,
      valid: false,
      editedIndex: -1,
      defaultItem: {
        _id: '',
        site: '',
        roomId: ''
      },
      editedItem: {
        _id: '',
        site: '',
        roomId: ''
      },
      headers: [
        { text: 'Room', value: '_id' },
        { text: 'Site', value: 'site' },
        { text: 'Actions', value: 'name', sortable: false }
      ]
    };
  },
  mounted() {
    this.defaultItem.roomId = this.editedItem.roomId = this.$store.state.roomId;
  }
};
</script>
