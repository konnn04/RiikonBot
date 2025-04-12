<template>
  <div class="error-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <div class="card shadow-lg">
            <div class="card-header bg-danger text-white text-center py-4">
              <h2 class="mb-0">{{ title || 'Error' }}</h2>
            </div>
            
            <div class="card-body p-5 text-center">
              <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
              
              <p class="mt-4 fs-5">{{ message || 'An unexpected error occurred.' }}</p>
              
              <div class="mt-4">
                <router-link to="/" class="btn btn-primary me-2">
                  <i class="bi bi-house-door me-1"></i> Back to Dashboard
                </router-link>
                <button @click="goBack" class="btn btn-outline-secondary">
                  <i class="bi bi-arrow-left me-1"></i> Go Back
                </button>
              </div>
              
              <div v-if="error && showDetails" class="mt-4 p-3 bg-dark text-light rounded text-start">
                <p class="mb-1 fw-bold">Error Details:</p>
                <code>{{ error }}</code>
              </div>
              
              <button 
                v-if="error" 
                @click="showDetails = !showDetails" 
                class="btn btn-sm btn-link mt-3"
              >
                {{ showDetails ? 'Hide' : 'Show' }} Technical Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorView',
  props: {
    title: String,
    message: String,
    error: String
  },
  data() {
    return {
      showDetails: false
    };
  },
  methods: {
    goBack() {
      window.history.length > 1 
        ? this.$router.go(-1) 
        : this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.error-page {
  background-color: var(--darker);
  background-image: linear-gradient(rgba(35, 39, 42, 0.8), rgba(35, 39, 42, 0.9));
  background-size: cover;
  background-position: center;
}

.card {
  background-color: var(--dark);
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

code {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
