<template>
  <div class="app-container d-flex">
    <!-- Sidebar -->
    <nav id="sidebar" class="sidebar bg-dark">
      <div class="sidebar-header">
        <h3 class="text-light py-3 px-3">RiikonBot</h3>
      </div>

      <ul class="list-unstyled components">
        <li>
          <router-link to="/" class="nav-link text-light d-flex align-items-center">
            <i class="bi bi-house-door me-2"></i> Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/guilds" class="nav-link text-light d-flex align-items-center">
            <i class="bi bi-server me-2"></i> Servers
          </router-link>
        </li>
        <li>
          <router-link to="/commands" class="nav-link text-light d-flex align-items-center">
            <i class="bi bi-terminal me-2"></i> Commands
          </router-link>
        </li>
        <li>
          <router-link to="/packages" class="nav-link text-light d-flex align-items-center">
            <i class="bi bi-box me-2"></i> Packages
          </router-link>
        </li>
        <li v-if="!isLocalhost">
          <a href="/auth/logout" class="nav-link text-light d-flex align-items-center">
            <i class="bi bi-box-arrow-right me-2"></i> Logout
          </a>
        </li>
      </ul>

      <div class="sidebar-footer text-light p-3">
        <small>&copy; {{ new Date().getFullYear() }} — RiikonBot</small>
      </div>
    </nav>

    <!-- Main Content -->
    <div id="content" class="content">
      <!-- Top navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
          <button type="button" id="sidebarCollapse" class="btn btn-primary d-md-none">
            <i class="bi bi-list"></i>
          </button>
          <span class="navbar-brand">RiikonBot Dashboard</span>
          <div class="d-flex align-items-center">
            <div v-if="botInfo" class="text-white small">
              <span class="me-2">
                <i class="bi bi-hdd-network"></i> {{ botInfo.guilds || 0 }} Servers
              </span>
              <span>
                <i class="bi bi-people"></i> {{ botInfo.users || 0 }} Users
              </span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <div class="container-fluid py-4">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      botInfo: null,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };
  },
  async created() {
    // Check authentication status
    if (!this.isLocalhost) {
      try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated && this.$route.path !== '/login') {
          this.$router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    
    // Get bot info for the header stats
    try {
      const response = await fetch('/api/bot');
      if (response.ok) {
        this.botInfo = await response.json();
      }
    } catch (error) {
      console.error('Error fetching bot info:', error);
    }
  },
  mounted() {
    // Toggle sidebar on mobile
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    if (sidebarCollapse) {
      sidebarCollapse.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
      });
    }
  }
};
</script>

<style>
/* Dark theme colors */
:root {
  --primary: #7289da;
  --secondary: #4e5d94;
  --dark: #2c2f33;
  --darker: #23272a;
  --light: #ffffff;
  --text-muted: #99aab5;
  --success: #43b581;
  --danger: #f04747;
  --warning: #faa61a;
  --info: #00b0f4;
}

body {
  background-color: var(--darker);
  color: var(--light);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 999;
  background: var(--dark);
  color: var(--light);
  transition: all 0.3s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.sidebar .sidebar-header {
  background: var(--darker);
}

.sidebar ul.components {
  padding: 20px 0;
  flex: 1;
}

.sidebar ul li a {
  padding: 10px 20px;
  font-size: 1.1em;
  display: block;
  color: var(--light);
  transition: all 0.3s;
}

.sidebar ul li a:hover {
  background: var(--primary);
}

.sidebar ul li a.router-link-active {
  background-color: var(--primary);
  color: white;
}

.sidebar-footer {
  background: var(--darker);
  text-align: center;
}

/* Content Styles */
.content {
  width: calc(100% - 250px);
  margin-left: 250px;
  transition: all 0.3s;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sidebar {
    margin-left: -250px;
  }
  
  .sidebar.active {
    margin-left: 0;
  }
  
  .content {
    width: 100%;
    margin-left: 0;
  }
  
  .sidebar.active + .content {
    width: calc(100% - 250px);
    margin-left: 250px;
  }
}

/* Dashboard card styles */
.card {
  background-color: var(--dark);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  background-color: var(--darker);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 20px;
  font-weight: 600;
}

.card-body {
  padding: 20px;
}

/* Table styles */
.table {
  color: var(--light);
}

.table thead th {
  border-bottom: 2px solid var(--secondary);
  border-top: none;
}

.table td, .table th {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Button styles */
.btn-primary {
  background-color: var(--primary);
  border-color: var(--primary);
}

.btn-primary:hover, .btn-primary:focus {
  background-color: var(--secondary);
  border-color: var(--secondary);
}

/* Form styles */
.form-control {
  background-color: var(--darker);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--light);
}

.form-control:focus {
  background-color: var(--darker);
  color: var(--light);
  border-color: var(--primary);
  box-shadow: 0 0 0 0.25rem rgba(114, 137, 218, 0.25);
}

/* Badge styles */
.badge-primary {
  background-color: var(--primary);
}

.badge-secondary {
  background-color: var(--secondary);
}

.badge-success {
  background-color: var(--success);
}

.badge-danger {
  background-color: var(--danger);
}
</style>