<template>
  <div class="container">
    <h1>Campus Buzz</h1>
    <h2>Submit a Campus Event</h2>

    <!-- Submission Form -->
    <form v-if="!submissionId" @submit.prevent="submitForm">
      <div class="field">
        <label>Event Title</label>
        <input type="text" v-model="form.title" placeholder="e.g. Career Fair 2025" />
      </div>
      <div class="field">
        <label>Description (min. 40 characters)</label>
        <textarea v-model="form.description" rows="4" placeholder="Describe the event..."></textarea>
        <small>{{ form.description.length }} characters</small>
      </div>
      <div class="field">
        <label>Location</label>
        <input type="text" v-model="form.location" placeholder="e.g. Main Hall" />
      </div>
      <div class="field">
        <label>Date (YYYY-MM-DD)</label>
        <input type="text" v-model="form.date" placeholder="e.g. 2025-09-01" />
      </div>
      <div class="field">
        <label>Organiser Name</label>
        <input type="text" v-model="form.organiser" placeholder="e.g. Student Union" />
      </div>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Submitting...' : 'Submit Event' }}
      </button>
      <p v-if="submitError" class="error">{{ submitError }}</p>
    </form>

    <!-- Waiting for result -->
    <div v-else-if="!result" class="status-box">
      <p>Submission received. Processing...</p>
      <p class="sub">Submission ID: {{ submissionId }}</p>
    </div>

    <!-- Result Display -->
    <div v-else class="result-box" :class="result.status.toLowerCase().replace(' ', '-')">
      <h2>Result</h2>
      <p><strong>Status:</strong> {{ result.status }}</p>
      <p><strong>Category:</strong> {{ result.category }}</p>
      <p><strong>Priority:</strong> {{ result.priority }}</p>
      <p><strong>Note:</strong> {{ result.note }}</p>
      <button @click="reset">Submit Another Event</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const WORKFLOW_URL = process.env.VUE_APP_WORKFLOW_URL || 'http://localhost:5001';
const DATA_URL     = process.env.VUE_APP_DATA_URL     || 'http://localhost:5002';

export default {
  data() {
    return {
      form: { title: '', description: '', location: '', date: '', organiser: '' },
      submitting: false,
      submitError: null,
      submissionId: null,
      result: null,
      pollTimer: null
    };
  },
  methods: {
    async submitForm() {
      this.submitting = true;
      this.submitError = null;
      try {
        const response = await axios.post(`${WORKFLOW_URL}/submit`, this.form);
        this.submissionId = response.data.submissionId;
        this.startPolling();
      } catch (err) {
        this.submitError = 'Could not reach the server. Please try again.';
      } finally {
        this.submitting = false;
      }
    },

    startPolling() {
      this.pollTimer = setInterval(async () => {
        try {
          const response = await axios.get(`${DATA_URL}/submissions/${this.submissionId}`);
          if (response.data.status !== 'PENDING') {
            this.result = response.data;
            clearInterval(this.pollTimer);
          }
        } catch (err) {
          console.error('Polling error:', err.message);
        }
      }, 1500);
    },

    reset() {
      clearInterval(this.pollTimer);
      this.form = { title: '', description: '', location: '', date: '', organiser: '' };
      this.submissionId = null;
      this.result = null;
      this.submitError = null;
    }
  },
  beforeUnmount() {
    clearInterval(this.pollTimer);
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.field {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
label { font-weight: bold; }
input, textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
}
small { color: #888; }
button {
  padding: 10px 24px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}
button:disabled { background: #aaa; }
.error { color: red; margin-top: 8px; }
.status-box { padding: 20px; background: #f0f0f0; border-radius: 8px; }
.sub { color: #888; font-size: 12px; }
.result-box { padding: 24px; border-radius: 8px; margin-top: 20px; }
.approved      { background: #d4edda; border: 1px solid #28a745; }
.incomplete    { background: #fff3cd; border: 1px solid #ffc107; }
.needs-revision { background: #f8d7da; border: 1px solid #dc3545; }
</style>
