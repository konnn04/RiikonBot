import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import router from './routes.js';

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import custom API service
import apiService from './services/api';

// Create Vue app
const app = createApp(App); 

// Register global properties
app.config.globalProperties.$api = apiService;

// Use router
app.use(router);

// Mount app
app.mount('#app');