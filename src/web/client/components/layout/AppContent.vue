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

<style>
/* Default light */
:root {
  --background-color: #f8f9fa;
  --text-color: #212529;
  --card-background: #ffffff;
  --text-color-card: #1f1f1f;
  --card-border: #dee2e6;
  --link-color: #007bff;
  --link-hover-color: #0056b3;
  --primary: #007bff;
  --text-muted: #6c757d;
  --btn-color: #007bff;
  /* Bts */
  --bs-secondary-color: #6c757d!important;
  --bs-body-bg: #fff!important;
  --bs-emphasis-color: #212529!important;
  --bs-border-color: #dee2e6!important;
  --bs-btn-color: #007bff!important;
  --bs-btn-border-color: #5dabff!important;
  --bs-btn-hover-color: #fff!important;

  --bs-info-rgb: 13, 110, 253!important;
  --bs-tertiary-bg: #f8f9fa!important;
  --bs-secondary-bg: #f8f9fa!important;
}

/* Dark theme class */
.dark-theme {
  --background-color: #121212;
  --text-color: #ffffff;
  --card-background: #1e1e1e;
  --text-color-card: #ffffff;
  --card-border: #2e2e2e;
  --link-color: #1e90ff;
  --link-hover-color: #1c86ee;
  --primary: #1e90ff;
  --text-muted: #d2d2d2;
  --btn-color: #1e90ff;
  --text-mute: #d2d2d2;
  /*  */
  --bs-secondary-color: #d2d2d2!important;
  --bs-body-bg: #1e1e1e!important;
  --bs-emphasis-color: #ffffff!important;
  --bs-border-color: #2e2e2e!important;
  --bs-btn-color: #1e90ff!important;
  --bs-btn-border-color: #4ba3fa!important;
  --bs-body-color: #ffffff!important;

  --bs-info-rgb: 13, 110, 253!important;
  --bs-tertiary-bg: #121212!important;
  --bs-secondary-bg: #121212!important;
}



</style>

<style scoped>
.content-container {
  flex: 1;
  overflow-y: auto;
  background-color: var(--background-color);
  color: var(--text-color);
  padding: 1rem; /* Added padding for better spacing */
}


</style>
