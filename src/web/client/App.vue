<template>
  <div class="app-container d-flex">
    <!-- Sidebar -->
    <app-sidebar />
    
    <!-- Main Content -->
    <app-content>
      <router-view />
    </app-content>
  </div>
</template>

<script>
import AppSidebar from './components/layout/AppSidebar.vue';
import AppContent from './components/layout/AppContent.vue';

export default {
  name: 'App',
  components: {
    AppSidebar,
    AppContent
  }
}
</script>

<style>
.app-container {
  height: 100vh;
  overflow: hidden;
}

/* Global styles */
:root {
  --darker: #232323;
  --primary: #0d6efd;
}
</style>