<template>
  <div class="server-status-card">
    <div class="card h-100">
      <div class="card-header bg-transparent">
        <h5 class="mb-0">{{ serverName }}</h5>
        <div class="status-indicator" :class="statusClass"></div>
      </div>
      
      <div class="card-body">
        <div class="server-stats">
          <div class="stat-item">
            <div class="stat-value">{{ memberCount }}</div>
            <div class="stat-label">Members</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ onlineCount }}</div>
            <div class="stat-label">Online</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ channelCount }}</div>
            <div class="stat-label">Channels</div>
          </div>
        </div>
        
        <div class="server-actions mt-3">
          <slot name="actions">
            <router-link :to="`/guilds/${serverId}`" class="btn btn-sm btn-primary">
              <i class="bi bi-gear me-1"></i> Manage
            </router-link>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServerStatusCard',
  props: {
    serverName: {
      type: String,
      required: true
    },
    serverId: {
      type: String,
      required: true
    },
    memberCount: {
      type: Number,
      default: 0
    },
    onlineCount: {
      type: Number,
      default: 0
    },
    channelCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'online',
      validator: value => ['online', 'offline', 'partial'].includes(value)
    }
  },
  computed: {
    statusClass() {
      return {
        'status-online': this.status === 'online',
        'status-offline': this.status === 'offline',
        'status-partial': this.status === 'partial'
      };
    }
  }
};
</script>

<style scoped>
.server-status-card {
  transition: all 0.3s;
}

.server-status-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-online {
  background-color: var(--success);
  box-shadow: 0 0 5px var(--success);
}

.status-offline {
  background-color: var(--danger);
  box-shadow: 0 0 5px var(--danger);
}

.status-partial {
  background-color: var(--warning);
  box-shadow: 0 0 5px var(--warning);
}

.server-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.server-actions {
  display: flex;
  justify-content: center;
}
</style>
