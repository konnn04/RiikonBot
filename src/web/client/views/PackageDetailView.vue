<template>
  <div class="package-detail-page">
    <!-- Back button -->
    <router-link to="/packages" class="btn btn-sm btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-1"></i> Back to Packages
    </router-link>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading package configuration...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <template v-else>
      <!-- Package header -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div class="package-icon me-3 rounded-circle d-flex align-items-center justify-content-center bg-primary text-white" style="width: 64px; height: 64px;">
              <i class="bi" :class="packageInfo.icon || 'bi-box'" style="font-size: 1.8rem;"></i>
            </div>
            <div>
              <h1 class="mb-1">{{ packageInfo.name }}</h1>
              <p class="text-muted mb-0" v-if="packageInfo.description">{{ packageInfo.description }}</p>
            </div>
            
            <div class="ms-auto">
              <span class="badge me-2" :class="packageInfo.enabled ? 'bg-success' : 'bg-danger'">
                {{ packageInfo.enabled ? 'Enabled' : 'Disabled' }}
              </span>
              <span class="badge bg-info" v-if="packageInfo.version">v{{ packageInfo.version }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Configuration Form -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Package Configuration</h5>
          <div>
            <button 
              class="btn btn-sm btn-outline-secondary me-2" 
              @click="resetForm"
              :disabled="saving"
            >
              Reset
            </button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="saveConfig"
              :disabled="saving || !hasChanges"
            >
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Save Changes
            </button>
          </div>
        </div>
        <div class="card-body">
          <div v-if="!packageConfig || Object.keys(packageConfig).length === 0" class="text-center py-4">
            <i class="bi bi-gear fs-1 text-muted"></i>
            <p class="mt-2">This package doesn't have any configurable settings.</p>
          </div>
          
          <form v-else @submit.prevent="saveConfig">
            <!-- Dynamically render form fields based on config -->
            <div class="mb-3" v-for="(value, key) in packageConfig" :key="key">
              <!-- Text input for strings -->
              <div v-if="typeof value === 'string'">
                <label :for="`config-${key}`" class="form-label">{{ formatLabel(key) }}</label>
                <input 
                  type="text" 
                  class="form-control" 
                  :id="`config-${key}`" 
                  v-model="formData[key]"
                  :placeholder="`Enter ${formatLabel(key).toLowerCase()}`"
                >
              </div>
              
              <!-- Number input -->
              <div v-else-if="typeof value === 'number'">
                <label :for="`config-${key}`" class="form-label">{{ formatLabel(key) }}</label>
                <input 
                  type="number" 
                  class="form-control" 
                  :id="`config-${key}`" 
                  v-model.number="formData[key]"
                >
              </div>
              
              <!-- Toggle for booleans -->
              <div v-else-if="typeof value === 'boolean'">
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="`config-${key}`" 
                    v-model="formData[key]"
                  >
                  <label class="form-check-label" :for="`config-${key}`">
                    {{ formatLabel(key) }}
                  </label>
                </div>
              </div>
              
              <!-- Select for arrays of options -->
              <div v-else-if="Array.isArray(value) && value.length > 0">
                <label :for="`config-${key}`" class="form-label">{{ formatLabel(key) }}</label>
                <select 
                  class="form-select" 
                  :id="`config-${key}`" 
                  v-model="formData[key]"
                >
                  <option v-for="option in value" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>
              
              <!-- Object handling with nested form -->
              <div v-else-if="typeof value === 'object' && value !== null">
                <fieldset class="border p-3 rounded mb-3">
                  <legend class="float-none w-auto px-2 fs-5">{{ formatLabel(key) }}</legend>
                  
                  <div class="mb-3" v-for="(nestedValue, nestedKey) in value" :key="`${key}-${nestedKey}`">
                    <!-- Text input for strings -->
                    <div v-if="typeof nestedValue === 'string'">
                      <label :for="`config-${key}-${nestedKey}`" class="form-label">{{ formatLabel(nestedKey) }}</label>
                      <input 
                        type="text" 
                        class="form-control" 
                        :id="`config-${key}-${nestedKey}`" 
                        v-model="formData[key][nestedKey]"
                      >
                    </div>
                    
                    <!-- Number input -->
                    <div v-else-if="typeof nestedValue === 'number'">
                      <label :for="`config-${key}-${nestedKey}`" class="form-label">{{ formatLabel(nestedKey) }}</label>
                      <input 
                        type="number" 
                        class="form-control" 
                        :id="`config-${key}-${nestedKey}`" 
                        v-model.number="formData[key][nestedKey]"
                      >
                    </div>
                    
                    <!-- Toggle for booleans -->
                    <div v-else-if="typeof nestedValue === 'boolean'">
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="`config-${key}-${nestedKey}`" 
                          v-model="formData[key][nestedKey]"
                        >
                        <label class="form-check-label" :for="`config-${key}-${nestedKey}`">
                          {{ formatLabel(nestedKey) }}
                        </label>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
            
            <!-- Success message -->
            <div v-if="saveSuccess" class="alert alert-success mt-3">
              Configuration saved successfully!
            </div>
          </form>
        </div>
      </div>
      
      <!-- Relevant Commands -->
      <div class="card mt-4" v-if="packageInfo.commands && packageInfo.commands.length > 0">
        <div class="card-header">
          <h5 class="mb-0">Package Commands</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th style="width: 100px;">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="command in packageInfo.commands" :key="command.name">
                  <td class="fw-bold">{{ command.name }}</td>
                  <td>{{ command.description }}</td>
                  <td>
                    <span :class="command.type === 'SLASH' ? 'badge bg-primary' : 'badge bg-secondary'">
                      {{ command.type }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { cloneDeep, isEqual } from 'lodash-es';

export default {
  name: 'PackageDetailView',
  data() {
    return {
      loading: true,
      saving: false,
      error: null,
      saveSuccess: false,
      packageInfo: {},
      packageConfig: {},
      formData: {},
      originalFormData: {}
    };
  },
  computed: {
    hasChanges() {
      return !isEqual(this.formData, this.originalFormData);
    }
  },
  async created() {
    await this.loadPackageData();
  },
  methods: {
    async loadPackageData() {
      try {
        this.loading = true;
        const packageName = this.$route.params.name;
        
        // Fetch package info from packages list
        const packages = await this.$api.packages.getAllPackages();
        this.packageInfo = packages.find(pkg => pkg.name === packageName);
        
        if (!this.packageInfo) {
          throw new Error(`Package '${packageName}' not found`);
        }
        
        // Fetch package configuration
        if (this.packageInfo.hasConfig) {
          this.packageConfig = await this.$api.packages.getPackageConfig(packageName);
          
          // Create a copy for the form
          this.formData = cloneDeep(this.packageConfig);
          this.originalFormData = cloneDeep(this.packageConfig);
        }
        
      } catch (error) {
        this.error = `Error loading package data: ${error.message}`;
        console.error('Error fetching package data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async saveConfig() {
      if (!this.hasChanges) return;
      
      this.saving = true;
      this.saveSuccess = false;
      
      try {
        const packageName = this.$route.params.name;
        await this.$api.packages.updatePackageConfig(packageName, this.formData);
        
        // Update original form data with new values
        this.originalFormData = cloneDeep(this.formData);
        
        // Show success message
        this.saveSuccess = true;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.saveSuccess = false;
        }, 3000);
      } catch (error) {
        this.error = `Error saving configuration: ${error.message}`;
        console.error('Error saving package configuration:', error);
      } finally {
        this.saving = false;
      }
    },
    
    resetForm() {
      this.formData = cloneDeep(this.originalFormData);
      this.saveSuccess = false;
    },
    
    formatLabel(key) {
      // Convert camelCase or snake_case to Title Case with spaces
      return key
        .replace(/([A-Z])/g, ' $1') // Insert space before uppercase letters
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
    }
  }
};
</script>

<style scoped>
fieldset {
  background-color: rgba(0, 0, 0, 0.05);
}

legend {
  background-color: var(--dark);
  font-size: 1rem;
}
</style>
