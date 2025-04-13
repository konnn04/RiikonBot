<template>
  <div class="guild-page">
    <!-- Back button -->
    <router-link to="/guilds" class="btn btn-sm btn-outline-secondary mb-3">
      <i class="bi bi-arrow-left me-1"></i> Back to Servers
    </router-link>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading server details...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <template v-else>
      <!-- Guild header -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <div v-if="guild.icon" class="me-3">
              <img :src="guild.icon" alt="Server icon" class="rounded-circle" width="64" height="64">
            </div>
            <div v-else class="me-3">
              <div class="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center bg-primary text-white" style="width: 64px; height: 64px;">
                {{ guild.name ? guild.name.charAt(0) : 'S' }}
              </div>
            </div>
            <div>
              <h1 class="mb-1">{{ guild.name }}</h1>
              <p class="text-muted mb-0">ID: {{ guild.id }}</p>
            </div>
            
            <div class="ms-auto">
              <span class="badge bg-success me-2">
                <i class="bi bi-people-fill me-1"></i> {{ guild.memberCount }} Members
              </span>
              <span v-if="guild.createdAt" class="badge bg-secondary">
                <i class="bi bi-calendar3 me-1"></i> {{ new Date(guild.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tab navigation -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'overview' }" 
            @click.prevent="activeTab = 'overview'" 
            href="#"
          >
            <i class="bi bi-info-circle me-1"></i> Overview
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'commands' }" 
            @click.prevent="activeTab = 'commands'" 
            href="#"
          >
            <i class="bi bi-terminal me-1"></i> Commands
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'members' }" 
            @click.prevent="activeTab = 'members'" 
            href="#"
          >
            <i class="bi bi-people me-1"></i> Members
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'roles' }" 
            @click.prevent="activeTab = 'roles'" 
            href="#"
          >
            <i class="bi bi-tags me-1"></i> Roles
          </a>
        </li>
        <li class="nav-item">
          <a 
            class="nav-link" 
            :class="{ active: activeTab === 'channels' }" 
            @click.prevent="activeTab = 'channels'" 
            href="#"
          >
            <i class="bi bi-hash me-1"></i> Channels
          </a>
        </li>
      </ul>
      
      <!-- Overview Tab -->
      <div v-show="activeTab === 'overview'" class="tab-content">
        <div class="row">
          <!-- Server Settings Card -->
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">Server Settings</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="updatePrefix">
                  <div class="mb-3">
                    <label for="prefix" class="form-label">Command Prefix</label>
                    <div class="input-group">
                      <input 
                        type="text" 
                        class="form-control" 
                        id="prefix" 
                        v-model="prefix" 
                        :disabled="updatingPrefix"
                        required
                      >
                      <button 
                        class="btn btn-primary" 
                        type="submit" 
                        :disabled="updatingPrefix || prefix === guild.prefix || !prefix"
                      >
                        <span v-if="updatingPrefix" class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Update
                      </button>
                    </div>
                    <small class="form-text text-muted">
                      This prefix is used for text commands in this server.
                    </small>
                  </div>
                </form>
                
                <div v-if="prefixUpdateSuccess" class="alert alert-success mt-3">
                  Prefix updated successfully!
                </div>
                <div v-if="prefixUpdateError" class="alert alert-danger mt-3">
                  {{ prefixUpdateError }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Server Stats Card -->
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">Server Statistics</h5>
              </div>
              <div class="card-body">
                <div class="row g-0">
                  <div class="col-6 mb-3">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-primary text-white rounded p-2 me-2">
                        <i class="bi bi-people"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.members.total || guild.memberCount }}</h6>
                        <small class="text-muted">Total Members</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6 mb-3">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-success text-white rounded p-2 me-2">
                        <i class="bi bi-person-check"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.members.online || 'N/A' }}</h6>
                        <small class="text-muted">Online Members</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6 mb-3">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-info text-white rounded p-2 me-2">
                        <i class="bi bi-hash"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.channels.total || 'N/A' }}</h6>
                        <small class="text-muted">Channels</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6 mb-3">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-warning text-white rounded p-2 me-2">
                        <i class="bi bi-tags"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.roles.total || 'N/A' }}</h6>
                        <small class="text-muted">Roles</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-secondary text-white rounded p-2 me-2">
                        <i class="bi bi-robot"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.members.botCount || 'N/A' }}</h6>
                        <small class="text-muted">Bots</small>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-6">
                    <div class="d-flex align-items-center">
                      <div class="stat-icon bg-danger text-white rounded p-2 me-2">
                        <i class="bi bi-emoji-smile"></i>
                      </div>
                      <div>
                        <h6 class="mb-0">{{ guild.stats?.emojis.total || 'N/A' }}</h6>
                        <small class="text-muted">Emojis</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Features and Info -->
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">Server Features</h5>
              </div>
              <div class="card-body">
                <div v-if="guild.features && guild.features.length" class="d-flex flex-wrap gap-2">
                  <span v-for="feature in guild.features" :key="feature" class="badge bg-primary">
                    {{ formatFeature(feature) }}
                  </span>
                </div>
                <p v-else class="text-muted mb-0">This server does not have any special features.</p>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="mb-0">Additional Information</h5>
              </div>
              <div class="card-body">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item bg-transparent d-flex justify-content-between">
                    <span class="text-muted">Server ID</span>
                    <span>{{ guild.id }}</span>
                  </li>
                  <li class="list-group-item bg-transparent d-flex justify-content-between">
                    <span class="text-muted">Created At</span>
                    <span>{{ guild.createdAt ? new Date(guild.createdAt).toLocaleString() : 'Unknown' }}</span>
                  </li>
                  <li class="list-group-item bg-transparent d-flex justify-content-between">
                    <span class="text-muted">Verification Level</span>
                    <span>{{ formatVerificationLevel(guild.verificationLevel) }}</span>
                  </li>
                  <li v-if="guild.vanityURLCode" class="list-group-item bg-transparent d-flex justify-content-between">
                    <span class="text-muted">Vanity URL</span>
                    <span>discord.gg/{{ guild.vanityURLCode }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Commands Tab -->
      <div v-show="activeTab === 'commands'" class="tab-content">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Server Commands</h5>
            <div class="input-group" style="max-width: 300px;">
              <input 
                type="text" 
                class="form-control" 
                placeholder="Search commands..." 
                v-model="commandSearch"
              >
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
            </div>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th style="width: 100px;">Type</th>
                    <th style="width: 100px;">Enabled</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="commands.length === 0">
                    <td colspan="4" class="text-center py-4">No commands available for this server.</td>
                  </tr>
                  <tr v-for="command in filteredCommands" :key="command.name + command.type">
                    <td>{{ command.name }}</td>
                    <td>{{ command.description }}</td>
                    <td>
                      <span 
                        :class="command.type === 'SLASH' ? 'badge bg-primary' : 'badge bg-secondary'"
                      >
                        {{ command.type }}
                      </span>
                    </td>
                    <td>
                      <div class="form-check form-switch">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :id="`command-${command.name}-${command.type}`" 
                          v-model="command.enabled"
                          :disabled="command.updating"
                          @change="toggleCommand(command)"
                        >
                        <label 
                          class="form-check-label" 
                          :for="`command-${command.name}-${command.type}`"
                        >
                          <span v-if="command.updating" class="spinner-border spinner-border-sm" role="status"></span>
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Members Tab -->
      <div v-show="activeTab === 'members'" class="tab-content">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Members</h5>
            <div class="d-flex gap-2">
              <select class="form-select" v-model="memberFilter.status" style="max-width: 150px;">
                <option value="">All Status</option>
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="offline">Offline</option>
              </select>
              <div class="input-group" style="max-width: 250px;">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Search members..." 
                  v-model="memberFilter.search"
                >
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <!-- Loading state for members -->
            <div v-if="loadingMembers" class="text-center p-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading members...</p>
            </div>
            
            <!-- Members display -->
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Roles</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in members" :key="member.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img 
                            v-if="member.avatar" 
                            :src="member.avatar" 
                            class="rounded-circle me-2" 
                            alt="Avatar" 
                            width="32"
                            height="32"
                          >
                          <div v-else class="avatar-placeholder rounded-circle me-2 d-flex align-items-center justify-content-center bg-secondary text-white" style="width: 32px; height: 32px;">
                            {{ member.displayName.charAt(0) }}
                          </div>
                          <div>
                            <div>{{ member.displayName }}</div>
                            <small class="text-muted">{{ member.username }}</small>
                          </div>
                          <span v-if="member.bot" class="badge bg-info ms-2">BOT</span>
                        </div>
                      </td>
                      <td>
                        <div class="role-badges">
                          <span 
                            v-for="role in member.roles.slice(0, 3)" 
                            :key="role.id" 
                            class="badge me-1 mb-1" 
                            :style="{ backgroundColor: role.color !== '#000000' ? role.color : '#666' }"
                          >
                            {{ role.name }}
                          </span>
                          <span v-if="member.roles.length > 3" class="badge bg-secondary">
                            +{{ member.roles.length - 3 }} more
                          </span>
                        </div>
                      </td>
                      <td>
                        <span :class="`status-badge status-${member.status}`">
                          {{ member.status }}
                        </span>
                      </td>
                      <td>
                        <small>{{ formatDate(member.joinedAt) }}</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="d-flex justify-content-between align-items-center p-3">
                <div>
                  Showing {{ members.length }} of {{ memberPagination.total }} members
                </div>
                <div>
                  <nav aria-label="Member pagination">
                    <ul class="pagination mb-0">
                      <li :class="['page-item', { disabled: memberPagination.offset === 0 }]">
                        <a 
                          class="page-link" 
                          href="#" 
                          @click.prevent="changeMemberPage(memberPagination.offset - memberPagination.limit)"
                        >
                          Previous
                        </a>
                      </li>
                      <li :class="['page-item', { disabled: !memberPagination.hasMore }]">
                        <a 
                          class="page-link" 
                          href="#" 
                          @click.prevent="changeMemberPage(memberPagination.offset + memberPagination.limit)"
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Roles Tab -->
      <div v-show="activeTab === 'roles'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Roles</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Members</th>
                    <th>Permissions</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!guild.roles || guild.roles.length === 0">
                    <td colspan="4" class="text-center py-4">No roles available for this server.</td>
                  </tr>
                  <tr v-for="role in guild.roles" :key="role.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="role-color me-2" :style="{ backgroundColor: role.color }"></div>
                        <span>{{ role.name }}</span>
                        <span v-if="role.managed" class="badge bg-info ms-2">Managed</span>
                      </div>
                    </td>
                    <td>{{ role.memberCount }}</td>
                    <td>
                      <div class="role-permissions">
                        <span 
                          v-for="(perm, index) in formatPermissions(role.permissions).slice(0, 3)" 
                          :key="index" 
                          class="badge bg-secondary me-1 mb-1"
                        >
                          {{ perm }}
                        </span>
                        <span v-if="formatPermissions(role.permissions).length > 3" class="badge bg-secondary">
                          +{{ formatPermissions(role.permissions).length - 3 }} more
                        </span>
                      </div>
                    </td>
                    <td><small class="text-muted">{{ role.id }}</small></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Channels Tab -->
      <div v-show="activeTab === 'channels'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Channels</h5>
          </div>
          <div class="card-body">
            <div v-if="!guild.channels || Object.keys(guild.channels).length === 0" class="text-center py-4">
              <p class="mb-0">No channels available for this server.</p>
            </div>
            
            <div v-else>
              <div v-for="(category, categoryId) in guild.channels" :key="categoryId" class="channel-category mb-4">
                <div class="category-header mb-2">
                  <strong>{{ category.name }}</strong>
                </div>
                
                <ul class="list-group">
                  <li v-for="channel in category.channels" :key="channel.id" class="list-group-item bg-transparent d-flex justify-content-between align-items-center">
                    <div>
                      <i 
                        :class="getChannelIcon(channel.type)" 
                        class="me-2"
                      ></i>
                      {{ channel.name }}
                      <span v-if="channel.nsfw" class="badge bg-danger ms-1">NSFW</span>
                    </div>
                    <small class="text-muted">{{ formatChannelType(channel.type) }}</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'GuildDetailView',
  data() {
    return {
      loading: true,
      error: null,
      guild: {},
      prefix: '',
      updatingPrefix: false,
      prefixUpdateSuccess: false,
      prefixUpdateError: null,
      
      // Commands
      commands: [],
      commandSearch: '',
      
      // UI state
      activeTab: 'overview',
      
      // Members
      members: [],
      loadingMembers: false,
      memberPagination: {
        limit: 50,
        offset: 0,
        total: 0,
        hasMore: false
      },
      memberFilter: {
        search: '',
        status: '',
        role: ''
      }
    };
  },
  computed: {
    filteredCommands() {
      if (!this.commandSearch) return this.commands;
      
      const query = this.commandSearch.toLowerCase();
      return this.commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query) || 
        cmd.description.toLowerCase().includes(query)
      );
    }
  },
  watch: {
    activeTab(newTab, oldTab) {
      // Load members when switching to members tab
      if (newTab === 'members' && (!this.members.length || oldTab !== 'members')) {
        this.loadMembers();
      }
    },
    'memberFilter.search'() {
      this.resetMembersPagination();
      this.loadMembers();
    },
    'memberFilter.status'() {
      this.resetMembersPagination();
      this.loadMembers();
    }
  },
  async created() {
    await this.loadGuildData();
  },
  methods: {
    async loadGuildData() {
      try {
        this.loading = true;
        const guildId = this.$route.params.id;
        
        // Fetch guild data
        const guild = await this.$api.guilds.getGuild(guildId);
        this.guild = guild;
        this.prefix = guild.prefix || '!';
        
        // Initialize commands with server-specific enabled status
        this.commands = guild.commands.map(cmd => ({
          ...cmd,
          updating: false
        }));
        
        this.loading = false;
      } catch (error) {
        this.error = `Error loading server data: ${error.message}`;
        console.error('Error fetching guild data:', error);
        this.loading = false;
      }
    },
    
    async updatePrefix() {
      if (!this.prefix || this.prefix === this.guild.prefix) return;
      
      this.prefixUpdateSuccess = false;
      this.prefixUpdateError = null;
      this.updatingPrefix = true;
      
      try {
        const result = await this.$api.guilds.updatePrefix(this.guild.id, this.prefix);
        this.guild.prefix = result.prefix;
        this.prefixUpdateSuccess = true;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.prefixUpdateSuccess = false;
        }, 3000);
      } catch (error) {
        this.prefixUpdateError = `Error updating prefix: ${error.message}`;
        console.error('Error updating prefix:', error);
      } finally {
        this.updatingPrefix = false;
      }
    },
    
    async toggleCommand(command) {
      try {
        command.updating = true;
        
        const result = await this.$api.commands.updateCommandStatus(
          this.guild.id, 
          command.name, 
          command.enabled,
          command.type
        );
        
        // Update the command with the result from the server
        command.enabled = result.enabled;
      } catch (error) {
        // Revert the toggle if there was an error
        command.enabled = !command.enabled;
        this.error = `Error updating command: ${error.message}`;
        console.error('Error updating command:', error);
      } finally {
        command.updating = false;
      }
    },
    
    async loadMembers() {
      this.loadingMembers = true;
      
      try {
        const response = await this.$api.guilds.getGuildMembers(this.guild.id, {
          limit: this.memberPagination.limit,
          offset: this.memberPagination.offset,
          search: this.memberFilter.search,
          status: this.memberFilter.status,
          role: this.memberFilter.role
        });
        
        this.members = response.members;
        this.memberPagination = response.pagination;
      } catch (error) {
        this.error = `Error loading members: ${error.message}`;
        console.error('Error loading members:', error);
      } finally {
        this.loadingMembers = false;
      }
    },
    
    changeMemberPage(newOffset) {
      if (newOffset < 0 || !this.memberPagination.hasMore && newOffset > this.memberPagination.offset) {
        return;
      }
      
      this.memberPagination.offset = newOffset;
      this.loadMembers();
    },
    
    resetMembersPagination() {
      this.memberPagination.offset = 0;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString();
    },
    
    formatFeature(feature) {
      // Convert SCREAMING_SNAKE_CASE to Title Case
      return feature
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    },
    
    formatVerificationLevel(level) {
      const levels = {
        0: 'None',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Very High'
      };
      
      return levels[level] || 'Unknown';
    },
    
    formatPermissions(permissions) {
      if (!permissions || !permissions.length) return [];
      
      // Convert permission strings to readable format
      return permissions.map(perm => 
        perm
          .split('_')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ')
      );
    },
    
    getChannelIcon(type) {
      const icons = {
        0: 'bi bi-hash', // Text channel
        2: 'bi bi-volume-up', // Voice channel
        4: 'bi bi-folder', // Category
        5: 'bi bi-megaphone', // Announcement channel
        13: 'bi bi-mic', // Stage channel
        15: 'bi bi-chat-square-text' // Forum
      };
      
      return icons[type] || 'bi bi-question-circle';
    },
    
    formatChannelType(type) {
      const types = {
        0: 'Text',
        2: 'Voice',
        4: 'Category',
        5: 'Announcement',
        13: 'Stage',
        15: 'Forum'
      };
      
      return types[type] || 'Unknown';
    }
  }
};
</script>

<style scoped>
.avatar-placeholder {
  font-weight: bold;
  font-size: 1.5rem;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

.status-online {
  background-color: var(--success);
  color: white;
}

.status-idle {
  background-color: var(--warning);
  color: white;
}

.status-dnd {
  background-color: var(--danger);
  color: white;
}

.status-offline {
  background-color: var(--secondary);
  color: white;
}

.category-header {
  font-size: 1rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>