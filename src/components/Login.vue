<template>
    <v-container fluid fill-height>
        <v-layout align-center justify-center row>
            <v-flex xs12 sm6 md4>
                <v-text-field label="Username" autofocus dark v-model="username" />
                <v-btn @click="submit">Submit</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
export default {
  data: () => ({
    username: ''
  }),
  methods: {
    submit() {
      this.$emit('login', this.username);
    }
  }
};
</script>
