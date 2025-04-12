<template>
  <span class="badge" :class="badgeClass">
    <slot>{{ label }}</slot>
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    status: {
      type: String,
      default: 'default'
    },
    label: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: ''
    }
  },
  computed: {
    badgeClass() {
      if (this.variant) {
        return `bg-${this.variant}`;
      }
      
      // Status-based styling
      const statusStyles = {
        'enabled': 'bg-success',
        'disabled': 'bg-danger',
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'online': 'bg-success',
        'offline': 'bg-secondary',
        'slash': 'bg-primary',
        'prefix': 'bg-secondary',
        'default': 'bg-secondary'
      };
      
      return statusStyles[this.status.toLowerCase()] || statusStyles.default;
    }
  }
}
</script>
