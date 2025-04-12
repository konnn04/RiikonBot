<template>
  <nav id="sidebar" class="sidebar bg-dark">
    <div class="sidebar-header">
      <h3 class="text-light py-3 px-3">{{ title }}</h3>
    </div>

    <ul class="list-unstyled components">
      <li v-for="item in menuItems" :key="item.path">
        <router-link :to="item.path" class="nav-link text-light d-flex align-items-center">
          <i :class="`bi ${item.icon} me-2`"></i> {{ item.label }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'AppSidebar',
  props: {
    title: {
      type: String,
      default: 'RiikonBot'
    },
    menuItems: {
      type: Array,
      default: () => [
        { path: '/', label: 'Dashboard', icon: 'bi-house-door' },
        { path: '/guilds', label: 'Servers', icon: 'bi-server' },
        { path: '/commands', label: 'Commands', icon: 'bi-terminal' },
        { path: '/packages', label: 'Packages', icon: 'bi-box' }
      ]
    }
  }
}
</script>

<style scoped>
.sidebar {
  min-width: 250px;
  max-width: 250px;
  min-height: 100vh;
  transition: all 0.3s;
}

.sidebar .sidebar-header {
  padding: 20px;
  background: rgba(0, 0, 0, 0.1);
}

.sidebar ul.components {
  padding: 20px 0;
}

.sidebar ul p {
  color: #fff;
  padding: 10px;
}

.sidebar ul li a {
  padding: 10px 20px;
  display: block;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

.sidebar ul li a:hover,
.sidebar ul li a.router-link-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
</style>
