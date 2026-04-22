<template>
  <div class="container">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-icon">🎓</div>
      <h1>Campus Buzz</h1>
      <p class="hero-subtitle">Share your campus events with the community</p>
    </div>

    <div class="main-layout">
      <!-- Submission Card -->
      <div class="card form-card">
        <div class="card-header">
          <span class="card-header-icon">📝</span>
          <h3>Event Details</h3>
        </div>

        <form @submit.prevent="submitForm">
          <div class="form-grid">
            <div class="field full-width">
              <label>Event Title</label>
              <div class="input-wrapper">
                <span class="input-icon">🏷️</span>
                <input
                    type="text"
                    v-model="form.title"
                    placeholder="e.g. Career Fair 2025"
                    :class="{ 'error-input': networkError && !form.title }"
                />
              </div>
            </div>

            <div class="field full-width">
              <label>Description</label>
              <div class="input-wrapper">
                <span class="input-icon">📄</span>
                <textarea
                    v-model="form.description"
                    rows="4"
                    placeholder="Describe your event (minimum 40 characters)..."
                    :class="{ 'error-input': networkError && !form.description }"
                ></textarea>
              </div>
              <div class="char-counter" :class="{ 'char-ok': form.description.length >= 40, 'char-warning': form.description.length > 0 && form.description.length < 40 }">
                <span class="char-bar" :style="{ width: Math.min(100, (form.description.length / 40) * 100) + '%' }"></span>
                <span class="char-text">{{ form.description.length }} / 40 characters</span>
              </div>
            </div>

            <div class="field">
              <label>Location</label>
              <div class="input-wrapper">
                <span class="input-icon">📍</span>
                <input
                    type="text"
                    v-model="form.location"
                    placeholder="e.g. Main Hall"
                    :class="{ 'error-input': networkError && !form.location }"
                />
              </div>
            </div>

            <div class="field">
              <label>Date</label>
              <div class="input-wrapper">
                <span class="input-icon">📅</span>
                <input
                    type="text"
                    v-model="form.date"
                    placeholder="YYYY-MM-DD"
                    :class="{ 'error-input': networkError && !form.date }"
                />
              </div>
            </div>

            <div class="field full-width">
              <label>Organiser</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input
                    type="text"
                    v-model="form.organiser"
                    placeholder="e.g. Student Union"
                    :class="{ 'error-input': networkError && !form.organiser }"
                />
              </div>
            </div>
          </div>

          <button type="submit" :disabled="submitting" class="submit-btn">
            <span v-if="submitting" class="spinner"></span>
            <span v-else class="btn-icon">✨</span>
            {{ submitting ? 'Submitting...' : 'Submit Event' }}
          </button>

          <p v-if="networkError" class="error network-error">
            <span class="error-icon">⚠️</span> {{ networkError }}
          </p>
        </form>
      </div>

      <!-- Status / Result Card -->
      <div v-if="submissionId && !result" class="card status-card">
        <div class="status-animation">
          <div class="pulse-ring"></div>
          <div class="processing-icon">⏳</div>
        </div>
        <h4>Processing Your Submission</h4>
        <p>Our system is reviewing your event details...</p>
        <div class="submission-id-badge">
          <span class="badge-label">Request ID</span>
          <span class="badge-value">{{ submissionId }}</span>
        </div>
      </div>

      <!-- Result Card -->
      <div v-if="result" class="card result-card" :class="getResultCardClass(result.status)">
        <div class="result-status-banner" :class="result.status.toLowerCase()">
          <span class="status-icon">{{ getResultIcon(result.status) }}</span>
          <span class="status-text">{{ result.status }}</span>
        </div>

        <div class="result-content">
          <div class="info-grid">
            <div class="info-item category-item">
              <span class="info-label">Category</span>
              <span class="info-value category-badge" :class="getCategoryClass(result.category)">
                {{ result.category }}
              </span>
            </div>
            <div class="info-item priority-item">
              <span class="info-label">Priority</span>
              <span class="info-value priority-badge" :class="getPriorityClass(result.priority)">
                {{ result.priority }}
              </span>
            </div>
          </div>

          <div class="note-section">
            <span class="note-icon">💡</span>
            <p>{{ result.note }}</p>
          </div>
        </div>

        <button @click="reset" class="reset-btn">
          <span class="btn-icon">🔄</span>
          Submit Another Event
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const WORKFLOW_URL = process.env.VUE_APP_WORKFLOW_URL || 'http://localhost:5001';
const DATA_URL = process.env.VUE_APP_DATA_URL || 'http://localhost:5002';

export default {
  data() {
    return {
      form: { title: '', description: '', location: '', date: '', organiser: '' },
      submitting: false,
      networkError: null,
      submissionId: null,
      result: null,
      pollTimer: null
    };
  },
  methods: {
    async submitForm() {
      this.submitting = true;
      this.networkError = null;

      try {
        const response = await axios.post(`${WORKFLOW_URL}/submit`, this.form);
        this.submissionId = response.data.submissionId;
        this.startPolling();
      } catch (err) {
        if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
          this.networkError = 'Cannot connect to server. Please check your connection.';
        } else if (err.response && err.response.status === 500) {
          this.networkError = 'Server error. Please try again later.';
        } else {
          console.error('Submission error:', err);
          this.networkError = 'Submission failed. Please try again.';
        }
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
      this.submissionId = null;
      this.result = null;
      this.networkError = null;
    },

    getResultIcon(status) {
      const icons = { 'APPROVED': '✅', 'INCOMPLETE': '⚠️', 'NEEDS REVISION': '🔧' };
      return icons[status] || '📋';
    },

    getResultCardClass(status) {
      return status.toLowerCase();
    },

    getCategoryClass(category) {
      const classes = {
        'OPPORTUNITY': 'cat-opportunity',
        'ACADEMIC': 'cat-academic',
        'SOCIAL': 'cat-social',
        'GENERAL': 'cat-general'
      };
      return classes[category] || '';
    },

    getPriorityClass(priority) {
      const classes = {
        'HIGH': 'pri-high',
        'MEDIUM': 'pri-medium',
        'NORMAL': 'pri-normal'
      };
      return classes[priority] || '';
    }
  },
  beforeUnmount() {
    clearInterval(this.pollTimer);
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f4f0 0%, #d4e8e0 100%);
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.hero-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-section h1 {
  background: linear-gradient(135deg, #2d6a4f, #1b4332);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.hero-subtitle {
  color: #40916c;
  font-size: 1.1rem;
}

/* Main Layout */
.main-layout {
  max-width: 700px;
  margin: 0 auto;
}

/* Cards */
.card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

/* Form Card */
.form-card .card-header {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header-icon {
  font-size: 28px;
}

.card-header h3 {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

form {
  padding: 28px 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.full-width {
  grid-column: 1 / -1;
}

label {
  font-weight: 600;
  color: #2d6a4f;
  font-size: 0.85rem;
  letter-spacing: 0.3px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  pointer-events: none;
}

input, textarea {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid #d8f3dc;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #f8fff8;
}

textarea {
  padding: 12px 16px 12px 44px;
  resize: vertical;
  min-height: 100px;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #2d6a4f;
  background: white;
  box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
}

input.error-input, textarea.error-input {
  border-color: #e63946;
  background: #fff5f5;
}

/* Character Counter */
.char-counter {
  position: relative;
  height: 24px;
  background: #e8f4f0;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 4px;
}

.char-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #2d6a4f, #40916c);
  transition: width 0.3s ease;
  border-radius: 12px;
}

.char-text {
  position: relative;
  font-size: 11px;
  color: #1b4332;
  display: block;
  text-align: right;
  padding-right: 8px;
  line-height: 24px;
  z-index: 1;
  font-weight: 500;
}

.char-warning .char-bar {
  background: linear-gradient(90deg, #e9c46a, #f4a261);
}

.char-ok .char-bar {
  background: linear-gradient(90deg, #2d6a4f, #40916c);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  margin-top: 24px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #2d6a4f, #40916c);
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 10px 20px rgba(45, 106, 79, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 18px;
}

/* Status Card */
.status-card {
  text-align: center;
  padding: 32px 24px;
}

.status-animation {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(45, 106, 79, 0.15);
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.processing-icon {
  position: relative;
  font-size: 48px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-card h4 {
  color: #1b4332;
  font-size: 1.2rem;
  margin-bottom: 8px;
}

.status-card p {
  color: #52b788;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.submission-id-badge {
  background: #e8f4f0;
  border-radius: 12px;
  padding: 12px;
  display: inline-block;
}

.badge-label {
  display: block;
  font-size: 11px;
  color: #52b788;
  letter-spacing: 0.5px;
}

.badge-value {
  display: block;
  font-size: 12px;
  font-family: monospace;
  color: #1b4332;
  font-weight: 600;
}

/* Result Card */
.result-card {
  overflow: hidden;
}

.result-status-banner {
  padding: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.result-status-banner.approved {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
}

.result-status-banner.incomplete {
  background: linear-gradient(135deg, #e9c46a, #f4a261);
}

.result-status-banner.needs-revision {
  background: linear-gradient(135deg, #e76f51, #f4a261);
}

.status-icon {
  font-size: 32px;
}

.status-text {
  font-size: 24px;
  font-weight: 700;
  color: rgb(0, 0, 0);
  letter-spacing: 1px;
}

.result-content {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  text-align: center;
  padding: 12px;
  background: #f8fff8;
  border-radius: 16px;
  border: 1px solid #d8f3dc;
}

.info-label {
  display: block;
  font-size: 11px;
  color: #52b788;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.cat-opportunity {
  background: #d8f3dc;
  color: #1b4332;
}

.cat-academic {
  background: #cfe8ff;
  color: #1e6091;
}

.cat-social {
  background: #f3e8ff;
  color: #6b21a5;
}

.cat-general {
  background: #e8f4f0;
  color: #2d6a4f;
}

.priority-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.pri-high {
  background: #fee2e2;
  color: #c92a2a;
}

.pri-medium {
  background: #fff3e0;
  color: #e67700;
}

.pri-normal {
  background: #d8f3dc;
  color: #2d6a4f;
}

.note-section {
  background: #f8fff8;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border: 1px solid #d8f3dc;
}

.note-icon {
  font-size: 20px;
}

.note-section p {
  flex: 1;
  color: #2d6a4f;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.reset-btn {
  width: calc(100% - 48px);
  margin: 0 24px 24px 24px;
  padding: 12px;
  background: white;
  color: #2d6a4f;
  border: 2px solid #d8f3dc;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.reset-btn:hover {
  background: #f8fff8;
  border-color: #2d6a4f;
  color: #1b4332;
}

.network-error {
  margin-top: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #e63946;
}

.error-icon {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .hero-section h1 {
    font-size: 2rem;
  }

  .hero-icon {
    font-size: 48px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card {
    border-radius: 20px;
  }
}
</style>