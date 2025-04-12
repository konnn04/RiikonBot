<template>
  <div class="uptime-display">
    <div class="time-unit">
      <div class="time-value">{{ days }}</div>
      <div class="time-label">{{ days === 1 ? 'Day' : 'Days' }}</div>
    </div>
    
    <div class="time-separator">:</div>
    
    <div class="time-unit">
      <div class="time-value">{{ hours }}</div>
      <div class="time-label">{{ hours === 1 ? 'Hour' : 'Hours' }}</div>
    </div>
    
    <div class="time-separator">:</div>
    
    <div class="time-unit">
      <div class="time-value">{{ minutes }}</div>
      <div class="time-label">{{ minutes === 1 ? 'Minute' : 'Minutes' }}</div>
    </div>
    
    <div class="time-separator">:</div>
    
    <div class="time-unit">
      <div class="time-value">{{ seconds }}</div>
      <div class="time-label">{{ seconds === 1 ? 'Second' : 'Seconds' }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UptimeDisplay',
  props: {
    days: {
      type: Number,
      default: 0
    },
    hours: {
      type: Number,
      default: 0
    },
    minutes: {
      type: Number,
      default: 0
    },
    seconds: {
      type: Number,
      default: 0
    }
  }
};
</script>

<style scoped>
.uptime-display {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem 0;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  min-width: 80px;
}

.time-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.time-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.time-separator {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0.25rem;
  color: var(--text-muted);
  align-self: flex-start;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .time-unit {
    padding: 0.5rem;
    min-width: 60px;
  }
  
  .time-value {
    font-size: 1.5rem;
  }
  
  .time-separator {
    font-size: 1.5rem;
  }
}
</style>
