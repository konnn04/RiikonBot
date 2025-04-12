<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <div class="card shadow-lg">
            <div class="card-header bg-primary text-white text-center py-4">
              <h2 class="mb-0">RiikonBot Dashboard</h2>
              <p class="mb-0">Login to access the dashboard</p>
            </div>
            
            <div class="card-body p-4">
              <!-- Error message -->
              <div v-if="error" class="alert alert-danger mb-4">
                {{ error }}
              </div>
              
              <!-- Login form -->
              <div v-if="!isLocalhost && !isAuthenticated" class="text-center">
                <div class="mb-4">
                  <p>Please login with your Discord account to access the dashboard.</p>
                </div>
                
                <a href="/auth/discord" class="btn btn-lg btn-primary d-flex align-items-center justify-content-center w-100">
                  <i class="bi bi-discord me-2 fs-5"></i>
                  Login with Discord
                </a>
                
                <div class="mt-4 text-muted small">
                  <p>By logging in, you authorize the bot to access your Discord information.</p>
                </div>
              </div>
              
              <!-- Local development mode notice -->
              <div v-if="isLocalhost && !isAuthenticated" class="text-center">
                <div class="alert alert-info mb-4">
                  <h5 class="alert-heading">Development Mode</h5>
                  <p>Authentication is bypassed in local development mode.</p>
                </div>
                
                <button @click="proceedToDashboard" class="btn btn-lg btn-success d-flex align-items-center justify-content-center w-100">
                  <i class="bi bi-code-slash me-2 fs-5"></i>
                  Continue as Developer
                </button>
              </div>
              
              <!-- Already authenticated -->
              <div v-if="isAuthenticated" class="text-center">
                <div class="alert alert-success mb-4">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  You are already logged in
                </div>
                
                <button @click="proceedToDashboard" class="btn btn-lg btn-primary d-flex align-items-center justify-content-center w-100">
                  <i class="bi bi-speedometer2 me-2 fs-5"></i>
                  Go to Dashboard
                </button>
              </div>
            </div>
            
            <div class="card-footer bg-dark text-center text-light py-3">
              <p class="mb-0 small">&copy; {{ new Date().getFullYear() }} — RiikonBot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      isAuthenticated: false,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      error: null
    };
  },
  async created() {
    // Check authentication status
    if (!this.isLocalhost) {
      try {
        const authResponse = await fetch('/api/auth/status');
        if (!authResponse.ok) {
          throw new Error(`Authentication status check failed: ${authResponse.status}`);
        }
        
        const authData = await authResponse.json();
        this.isAuthenticated = authData.authenticated;
        
        // If already authenticated, redirect to dashboard after a short delay
        if (this.isAuthenticated) {
          setTimeout(this.proceedToDashboard, 1500);
        }
      } catch (error) {
        this.error = 'Failed to check authentication status. Please try again.';
        console.error('Auth check failed:', error);
      }
    }
  },
  methods: {
    proceedToDashboard() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.login-page {
  background-color: var(--darker);
  background-image: linear-gradient(rgba(35, 39, 42, 0.8), rgba(35, 39, 42, 0.9)), 
                    url('/img/discord-bg.svg');
  background-size: cover;
  background-position: center;
}

.card {
  background-color: var(--dark);
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.btn-discord {
  background-color: #5865F2;
  border-color: #5865F2;
}

.btn-discord:hover {
  background-color: #4752c4;
  border-color: #4752c4;
}
</style>
