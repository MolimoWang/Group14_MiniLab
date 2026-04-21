<template>
  <div>
    <h1>Campus Buzz Submission</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="form.title" />
      </div>
      <div>
        <label for="description">Description:</label>
        <textarea id="description" v-model="form.description"></textarea>
      </div>
      <div>
        <label for="location">Location:</label>
        <input type="text" id="location" v-model="form.location" />
      </div>
      <div>
        <label for="date">Date (YYYY-MM-DD):</label>
        <input type="text" id="date" v-model="form.date" />
      </div>
      <div>
        <label for="organiser">Organiser:</label>
        <input type="text" id="organiser" v-model="form.organiser" />
      </div>
      <button type="submit">Submit</button>
    </form>

    <div v-if="result">
      <h2>Submission Result</h2>
      <p><strong>Status:</strong> {{ result.status }}</p>
      <p v-if="result.message"><strong>Message:</strong> {{ result.message }}</p>
      <div v-if="result.status === 'APPROVED'">
        <p><strong>Category:</strong> {{ result.category }}</p>
        <p><strong>Priority:</strong> {{ result.priority }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        title: '',
        description: '',
        location: '',
        date: '',
        organiser: ''
      },
      result: null
    };
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post('http://localhost:5000/api/submit', this.form);
        this.result = response.data;
      } catch (error) {
        if (error.response) {
          this.result = error.response.data;
        } else {
          this.result = { status: 'Error', message: 'Could not connect to the server.' };
        }
      }
    }
  }
};
</script>

<style scoped>
form div {
  margin-bottom: 10px;
}
label {
  margin-right: 10px;
}
</style>
