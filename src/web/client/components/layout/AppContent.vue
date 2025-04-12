<template>
  <div class="content-container p-4">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'AppContent'
}
</script>

<style scoped>
.content-container {
  flex: 1;
  overflow-y: auto;
}
</style>
