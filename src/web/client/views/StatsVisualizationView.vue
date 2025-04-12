<template>
  <div class="stats-visualization">
    <page-header title="Statistics Visualization" />
    
    <div class="mb-4" v-if="loading">
      <loading-state message="Loading statistics data..." />
    </div>
    
    <div v-else-if="error">
      <error-alert :message="error" />
      <div class="alert alert-info mt-3">
        <i class="bi bi-info-circle-fill me-2"></i>
        Using mock data for preview purposes. Connect to the API for real data.
        <button @click="retryConnection" class="btn btn-outline-primary btn-sm ms-2">
          <i class="bi bi-arrow-clockwise me-1"></i> Retry Connection
        </button>
      </div>
    </div>
    
    <div v-else class="stats-content">
      <!-- Overview stats in cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3" v-for="(stat, index) in statCards" :key="index">
          <app-card :card-class="'h-100 stat-card'" :style="`border-left: 4px solid ${stat.color};`">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title h2">{{ displayStats[stat.key] }}</h5>
                <h6 class="card-subtitle">{{ stat.label }}</h6>
              </div>
              <div>
                <i :class="`bi ${stat.icon} fs-1`" :style="`color: ${stat.color};`"></i>
              </div>
            </div>
          </app-card>
        </div>
      </div>
      
      <!-- Uptime & Activity Stats -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-3">
          <app-card title="Uptime">
            <uptime-display :startTime="displayStats.startedTimestamp" />
            <div class="text-center mt-3">
              <small class="text-muted">
                Started at: {{ new Date(displayStats.startedTimestamp).toLocaleString() }}
              </small>
            </div>
          </app-card>
        </div>
        
        <div class="col-lg-6 mb-3">
          <app-card title="System Activity">
            <div class="metric-container">
              <div class="metric-item">
                <div class="metric-value">{{ formatPercent(systemMetrics.cpu) }}</div>
                <div class="metric-label">CPU Usage</div>
                <div class="progress">
                  <div class="progress-bar" :style="`width: ${systemMetrics.cpu}%; background-color: ${getColorForPercent(systemMetrics.cpu)};`"></div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-value">{{ formatPercent(systemMetrics.memory) }}</div>
                <div class="metric-label">Memory Usage</div>
                <div class="progress">
                  <div class="progress-bar" :style="`width: ${systemMetrics.memory}%; background-color: ${getColorForPercent(systemMetrics.memory)};`"></div>
                </div>
              </div>
              
              <div class="metric-item">
                <div class="metric-value">{{ displayStats.commands || 0 }}</div>
                <div class="metric-label">Commands Executed</div>
              </div>
            </div>
          </app-card>
        </div>
      </div>
      
      <!-- Packages & Commands Distribution -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-3">
          <app-card title="Packages Status">
            <div class="packages-status">
              <div class="package-chart">
                <div class="package-circle-outer">
                  <div class="package-circle-inner">
                    <div class="package-count">{{ displayStats.packages?.enabled || 0 }}</div>
                    <div class="package-label">Enabled</div>
                  </div>
                </div>
                <div class="package-progress" 
                     :style="`--progress: ${displayStats.packages ? (displayStats.packages.enabled / displayStats.packages.total) * 100 : 0}%`">
                </div>
              </div>
              <div class="package-details text-center mt-3">
                <div class="h6">{{ displayStats.packages?.enabled || 0 }} / {{ displayStats.packages?.total || 0 }} packages enabled</div>
                <div class="small text-muted">{{ formatPercent(displayStats.packages ? (displayStats.packages.enabled / displayStats.packages.total) * 100 : 0) }} of packages are active</div>
              </div>
            </div>
          </app-card>
        </div>
        
        <div class="col-lg-6 mb-3">
          <app-card title="Server Distribution">
            <div class="server-metrics">
              <div class="metric-item">
                <div class="d-flex justify-content-between">
                  <div><i class="bi bi-people me-2"></i>Average Users/Server:</div>
                  <div><b>{{ displayStats.guilds ? Math.round(displayStats.users / displayStats.guilds) : 0 }}</b></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="d-flex justify-content-between">
                  <div><i class="bi bi-terminal me-2"></i>Commands/Server:</div>
                  <div><b>{{ displayStats.guilds ? Math.round(displayStats.commands / displayStats.guilds * 10) / 10 : 0 }}</b></div>
                </div>
              </div>
              <div class="metric-item">
                <div class="d-flex justify-content-between">
                  <div><i class="bi bi-clock me-2"></i>Avg. Response Time:</div>
                  <div><b>{{ systemMetrics.responseTime }}ms</b></div>
                </div>
              </div>
            </div>
          </app-card>
        </div>
      </div>
      
      <!-- Additional stats or charts can be added here -->
    </div>
  </div>
</template>

<script>
import PageHeader from '../components/layout/PageHeader.vue';
import AppCard from '../components/ui/AppCard.vue';
import LoadingState from '../components/ui/LoadingState.vue';
import ErrorAlert from '../components/ui/ErrorAlert.vue';
import UptimeDisplay from '../components/UptimeDisplay.vue';

export default {
  name: 'StatsVisualizationView',
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
      stats: null,
      systemMetrics: {
        cpu: 45,
        memory: 62,
        responseTime: 127
      },
      statCards: [
        { key: 'guilds', label: 'Servers', icon: 'bi-server', color: '#0eaae3' },
        { key: 'users', label: 'Users', icon: 'bi-people', color:'#f57a22' },
        { key: 'commands', label: 'Commands', icon: 'bi-terminal', color: '#d41c2e' },
        { key: 'packagesStatus', label: 'Packages', icon: 'bi-box', color: '#13ad2a' },
      ],
      // Mock data for development when API is unavailable
      mockStats: {
        guilds: 42,
        users: 1568,
        commands: 845,
        packagesStatus: '8 / 12',
        packages: {
          total: 12,
          enabled: 8
        },
        startedTimestamp: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        uptime: {
          days: 3,
          hours: 4,
          minutes: 12,
          seconds: 36
        }
      }
    };
  },
  computed: {
    displayStats() {
      // Use real stats if available, otherwise use mock data
      return this.stats || this.mockStats;
    }
  },
  methods: {
    formatPercent(value) {
      return `${Math.round(value)}%`;
    },
    getColorForPercent(percent) {
      if (percent < 50) return '#13ad2a';
      if (percent < 80) return '#f57a22';
      return '#d41c2e';
    },
    retryConnection() {
      this.loading = true;
      this.error = null;
      this.loadStats();
    },
    async loadStats() {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.stats = await response.json();
        this.error = null;
      } catch (error) {
        console.error('Error loading statistics:', error);
        this.error = `API Connection Error: ${error.message}. Make sure your backend server is running.`;
        // We'll still use mock data (through the displayStats computed property)
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.loadStats();
  }
};
</script>

<style scoped>
.stats-visualization {
  padding-bottom: 2rem;
}

.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.metric-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metric-item {
  padding: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.metric-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.progress {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease;
}

.packages-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.package-chart {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 1rem auto;
}

.package-circle-outer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(19, 173, 42, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
}

.package-circle-inner {
  width: 75%;
  height: 75%;
  border-radius: 50%;
  background-color: var(--card-background);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.package-count {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.package-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.package-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#13ad2a 0% var(--progress), transparent var(--progress) 100%);
  transition: background 0.5s ease;
}

.server-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.server-metrics .metric-item {
  padding: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: all 0.3s;
}

.server-metrics .metric-item:hover {
  background-color: rgba(0, 0, 0, 0.08);
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .package-chart {
    width: 120px;
    height: 120px;
  }
  
  .package-count {
    font-size: 1.5rem;
  }
}
</style>
