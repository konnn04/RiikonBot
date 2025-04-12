<template>
  <div class="dashboard">
    <page-header title="Dashboard" />
    
    <!-- Stats Overview -->
    <div class="row mb-4" v-if="stats">
      <div class="col-md-3 col-sm-6 mb-3" v-for="(stat, index) in statCards" :key="index">
        <app-card :card-class="`bg-${stat.color} text-white h-100`">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="card-title h2">{{ stats[stat.key] }}</h5>
              <h6 class="card-subtitle">{{ stat.label }}</h6>
            </div>
            <div>
              <i :class="`bi ${stat.icon} fs-1`"></i>
            </div>
          </div>
        </app-card>
      </div>
    </div>
    
    <div class="row">
      <!-- Bot Info Card -->
      <div class="col-lg-6 mb-4">
        <app-card title="Bot Information">
          <loading-state v-if="loading" message="Loading bot information..." />
          <error-alert v-else-if="error" :message="error" />
          <div v-else-if="botInfo" class="table-responsive">
            <table class="table">
              <tbody>
                <tr v-for="(value, key) in botInfoDisplay" :key="key">
                  <th scope="row">{{ key }}</th>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </app-card>
      </div>
      
      <!-- Uptime Card -->
      <div class="col-lg-6 mb-4">
        <app-card title="Uptime">
          <uptime-display v-if="stats" :uptime="stats.uptime" />
          <loading-state v-else message="Loading uptime data..." />
        </app-card>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <app-card title="Quick Actions">
      <div class="row g-3">
        <div class="col-md-3 col-sm-6" v-for="(action, index) in quickActions" :key="index">
          <router-link :to="action.path" class="btn d-block" :class="`btn-${action.color}`">
            <i :class="`bi ${action.icon} me-2`"></i> {{ action.label }}
          </router-link>
        </div>
      </div>
    </app-card>
  </div>
</template>

<script>
import PageHeader from '../components/layout/PageHeader.vue';
import AppCard from '../components/ui/AppCard.vue';
import LoadingState from '../components/ui/LoadingState.vue';
import ErrorAlert from '../components/ui/ErrorAlert.vue';
import UptimeDisplay from '../components/UptimeDisplay.vue';

export default {
  name: 'HomeView',
  components: {
    PageHeader,
    AppCard, 
    LoadingState,
    ErrorAlert,
    UptimeDisplay
  },
  data() {
    return {
      loading: true,
      error: null,
      botInfo: null,
      stats: null,
      statCards: [
        { key: 'guilds', label: 'Servers', color: 'primary', icon: 'bi-server' },
        { key: 'users', label: 'Users', color: 'success', icon: 'bi-people' },
        { key: 'commands', label: 'Commands', color: 'info', icon: 'bi-terminal' },
        { key: 'packages', label: 'Packages', color: 'warning', icon: 'bi-box' },
      ],
      quickActions: [
        { label: 'Manage Servers', path: '/guilds', color: 'primary', icon: 'bi-server' },
        { label: 'View Commands', path: '/commands', color: 'success', icon: 'bi-terminal' },
        { label: 'Manage Packages', path: '/packages', color: 'info', icon: 'bi-box' },
        { label: 'View Statistics', path: '/stats', color: 'warning', icon: 'bi-graph-up' }
      ]
    };
  },
  computed: {
    botInfoDisplay() {
      if (!this.botInfo) return {};
      return {
        'Username': this.botInfo.username,
        'ID': this.botInfo.id,
        'Servers': this.botInfo.guilds,
        'Users': this.botInfo.users
      };
    }
  },
  async created() {
    try {
      // Load bot information
      const response = await fetch('/api/bot/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.botInfo = await response.json();
      
      // Load stats
      const statsResponse = await fetch('/api/stats');
      if (statsResponse.ok) {
        this.stats = await statsResponse.json();
      }
      
      this.loading = false;
    } catch (error) {
      this.error = `Error loading data: ${error.message}`;
      this.loading = false;
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