<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle-btn"
    :title="isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <i :class="isDarkTheme ? 'bi bi-sun' : 'bi bi-moon'"></i>
  </button>
</template>

<script>
export default {
  name: 'ThemeSwitcher',
  data() {
    return {
      isDarkTheme: false
    };
  },
  mounted() {
    // Check for saved theme preference or prefer-color-scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkTheme = savedTheme === 'dark';
      this.applyTheme();
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.isDarkTheme = true;
      this.applyTheme();
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        this.isDarkTheme = e.matches;
        this.applyTheme();
      }
    });
  },
  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      this.applyTheme();
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    },
    applyTheme() {
      if (this.isDarkTheme) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    }
  }
};
</script>

<style scoped>
.theme-toggle-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  aspect-ratio: 1;
}

.theme-toggle-btn:hover {
  background-color: unset;
}
</style>
