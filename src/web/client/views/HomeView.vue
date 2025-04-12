<template>
  <div class="dashboard">
    <h1 class="mb-4">Dashboard</h1>
    
    <!-- Stats Overview -->
    <div class="row mb-4" v-if="stats">
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title h2">{{ stats.guilds }}</h5>
                <h6 class="card-subtitle">Servers</h6>
              </div>
              <div>
                <i class="bi bi-server fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title h2">{{ stats.users }}</h5>
                <h6 class="card-subtitle">Users</h6>
              </div>
              <div>
                <i class="bi bi-people fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title h2">{{ stats.commands }}</h5>
                <h6 class="card-subtitle">Commands</h6>
              </div>
              <div>
                <i class="bi bi-terminal fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-3 col-sm-6 mb-3">
        <div class="card bg-warning text-white h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title h2">{{ stats.packages?.enabled || 0 }}/{{ stats.packages?.total || 0 }}</h5>
                <h6 class="card-subtitle">Active Packages</h6>
              </div>
              <div>
                <i class="bi bi-box fs-1"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bot Info Card -->
    <div class="row mb-4">
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Bot Information</h5>
            <span class="badge bg-success" v-if="botInfo">Online</span>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <div v-else-if="botInfo" class="table-responsive">
              <table class="table">
                <tbody>
                  <tr>
                    <th scope="row">Username</th>
                    <td>{{ botInfo.username }}</td>
                  </tr>
                  <tr>
                    <th scope="row">ID</th>
                    <td>{{ botInfo.id }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Servers</th>
                    <td>{{ botInfo.guilds }}</td>
                  </tr>
                  <tr>
                    <th scope="row">Users</th>
                    <td>{{ botInfo.users }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Uptime Card -->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="mb-0">Uptime</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <div v-else-if="stats && stats.uptime" class="d-flex justify-content-center">
              <div class="text-center mx-3">
                <h2 class="mb-0">{{ stats.uptime.days }}</h2>
                <small>Days</small>
              </div>
              <div class="text-center mx-3">
                <h2 class="mb-0">{{ stats.uptime.hours }}</h2>
                <small>Hours</small>
              </div>
              <div class="text-center mx-3">
                <h2 class="mb-0">{{ stats.uptime.minutes }}</h2>
                <small>Minutes</small>
              </div>
              <div class="text-center mx-3">
                <h2 class="mb-0">{{ stats.uptime.seconds }}</h2>
                <small>Seconds</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3 col-sm-6">
                <router-link to="/guilds" class="btn btn-primary d-block">
                  <i class="bi bi-server me-2"></i> Manage Servers
                </router-link>
              </div>
              <div class="col-md-3 col-sm-6">
                <router-link to="/commands" class="btn btn-success d-block">
                  <i class="bi bi-terminal me-2"></i> View Commands
                </router-link>
              </div>
              <div class="col-md-3 col-sm-6">
                <router-link to="/packages" class="btn btn-info d-block">
                  <i class="bi bi-box me-2"></i> Manage Packages
                </router-link>
              </div>
              <div class="col-md-3 col-sm-6">
                <a href="https://github.com/Riikon-Team/RiikonBot" target="_blank" class="btn btn-secondary d-block">
                  <i class="bi bi-github me-2"></i> GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="row mt-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Recent Activity</h5>
            <button class="btn btn-sm btn-outline-secondary" @click="loadRecentActivity" :disabled="loadingActivity">
              <i class="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="loadingActivity" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading recent activity...</p>
            </div>
            
            <div v-else-if="activityError" class="alert alert-danger m-3">
              {{ activityError }}
            </div>
            
            <div v-else-if="!recentActivity || recentActivity.length === 0" class="text-center py-5">
              <i class="bi bi-clock-history fs-1 text-muted"></i>
              <p class="mt-2 text-muted">No recent activity found</p>
            </div>
            
            <ul v-else class="list-group list-group-flush">
              <li v-for="(activity, index) in recentActivity" :key="index" class="list-group-item bg-transparent">
                <div class="d-flex">
                  <div class="activity-icon me-3 rounded-circle d-flex align-items-center justify-content-center" :class="getActivityIconClass(activity.type)">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div>
                    <div class="fw-bold">{{ activity.title }}</div>
                    <p class="mb-0 text-muted">{{ activity.description }}</p>
                    <small class="text-muted">{{ formatDate(activity.timestamp) }}</small>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      loading: true,
      error: null,
      botInfo: null,
      stats: null,
      recentActivity: [],
      loadingActivity: false,
      activityError: null
    };
  },
  async created() {
    try {
      // Load bot info
      const botInfo = await this.$api.bot.getBotInfo();
      this.botInfo = botInfo;
      
      // Load stats
      const stats = await this.$api.stats.getStats();
      this.stats = stats;
      
      // Load recent activity
      await this.loadRecentActivity();
    } catch (error) {
      this.error = `Error loading dashboard data: ${error.message}`;
      console.error('Error fetching dashboard data:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadRecentActivity() {
      this.loadingActivity = true;
      this.activityError = null;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        
        this.recentActivity = [];
      } catch (error) {
        this.activityError = `Failed to load recent activity: ${error.message}`;
        console.error('Error loading recent activity:', error);
      } finally {
        this.loadingActivity = false;
      }
    },
    getActivityIcon(type) {
      const icons = {
        server_join: 'bi bi-plus-circle',
        command: 'bi bi-terminal',
        error: 'bi bi-exclamation-triangle',
        update: 'bi bi-arrow-up-circle',
        default: 'bi bi-activity'
      };
      
      return icons[type] || icons.default;
    },
    getActivityIconClass(type) {
      const classes = {
        server_join: 'bg-success text-white',
        command: 'bg-primary text-white',
        error: 'bg-danger text-white',
        update: 'bg-info text-white',
        default: 'bg-secondary text-white'
      };
      
      return classes[type] || classes.default;
    },
    formatDate(date) {
      if (!date) return '';
      
      const now = new Date();
      const diff = now - new Date(date);
      
      // Less than a minute
      if (diff < 60000) {
        return 'Just now';
      }
      // Less than an hour
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      // Less than a day
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      // Less than a week
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
      
      // Default to formatted date
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.activity-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.btn {
  transition: all 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card {
  transition: all 0.3s;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard h1 {
  color: var(--light);
  font-weight: 600;
  margin-bottom: 1.5rem;
}
</style>