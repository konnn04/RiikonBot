import express from 'express';
import logger from '../../utils/logger.js';
import prisma from '../../utils/prisma.js';
import { isAuthenticated } from './middleware.js';

const router = express.Router();

// API lấy danh sách servers
router.get('/guilds', isAuthenticated, async (req, res) => {
  try {
    const client = req.app.get('client');
    
    // Lấy danh sách guilds từ Discord API
    const discordGuilds = client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.iconURL()
    }));
    
    // Lấy thông tin từ database
    const dbGuilds = await prisma.guild.findMany({
      select: {
        id: true,
        prefix: true
      }
    });
    
    const guildsMap = new Map();
    dbGuilds.forEach(guild => guildsMap.set(guild.id, guild));
    
    // Map Discord guilds with enhanced information
    const guilds = discordGuilds.map(guild => {
      // Get Discord guild object to access more properties
      const discordGuild = client.guilds.cache.get(guild.id);
      
      // Calculate member status counts
      const memberStatusCounts = {
        online: 0,
        idle: 0,
        dnd: 0,
        offline: 0
      };
      
      discordGuild.members.cache.forEach(member => {
        const status = member.presence?.status || 'offline';
        if (memberStatusCounts[status] !== undefined) {
          memberStatusCounts[status]++;
        }
      });
      
      // Get activity summary
      const activities = new Map();
      discordGuild.members.cache.forEach(member => {
        if (member.presence?.activities) {
          member.presence.activities.forEach(activity => {
            if (!activities.has(activity.type)) {
              activities.set(activity.type, 0);
            }
            activities.set(activity.type, activities.get(activity.type) + 1);
          });
        }
      });
      
      // Convert activities map to object
      const activitySummary = {};
      activities.forEach((count, type) => {
        activitySummary[type] = count;
      });
      
      // Return enhanced guild object
      return {
        ...guild,
        prefix: guildsMap.has(guild.id) ? guildsMap.get(guild.id).prefix : '!',
        // Basic summary info
        stats: {
          members: {
            total: discordGuild.memberCount,
            online: memberStatusCounts.online,
            idle: memberStatusCounts.idle,
            dnd: memberStatusCounts.dnd,
            offline: memberStatusCounts.offline,
            active: memberStatusCounts.online + memberStatusCounts.idle + memberStatusCounts.dnd,
            botCount: discordGuild.members.cache.filter(member => member.user.bot).size,
            humanCount: discordGuild.members.cache.filter(member => !member.user.bot).size
          },
          channels: {
            total: discordGuild.channels.cache.size,
            text: discordGuild.channels.cache.filter(channel => channel.type === 0).size,
            voice: discordGuild.channels.cache.filter(channel => channel.type === 2).size,
            category: discordGuild.channels.cache.filter(channel => channel.type === 4).size,
            forum: discordGuild.channels.cache.filter(channel => channel.type === 15).size,
            announcement: discordGuild.channels.cache.filter(channel => channel.type === 5).size
          },
          roles: {
            total: discordGuild.roles.cache.size,
            manageable: discordGuild.roles.cache.filter(role => role.managed).size
          },
          emojis: {
            total: discordGuild.emojis.cache.size,
            animated: discordGuild.emojis.cache.filter(emoji => emoji.animated).size,
            static: discordGuild.emojis.cache.filter(emoji => !emoji.animated).size
          },
          stickers: {
            total: discordGuild.stickers?.cache.size || 0
          },
          activitySummary
        },
        // Guild features from Discord
        features: discordGuild.features,
        // Add creation date
        createdAt: discordGuild.createdAt,
        // Add verification level
        verificationLevel: discordGuild.verificationLevel,
        // Add vanity URL if available
        vanityURLCode: discordGuild.vanityURLCode
      };
    });
    
    // Đồng bộ guilds vào database nếu chưa có
    for (const guild of discordGuilds) {
      if (!guildsMap.has(guild.id)) {
        await prisma.guild.upsert({
          where: { id: guild.id },
          update: { name: guild.name },
          create: {
            id: guild.id,
            name: guild.name,
            prefix: '!'
          }
        });
      }
    }
    
    res.json(guilds);
  } catch (error) {
    logger.error('Error fetching guilds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API lấy chi tiết server
router.get('/guilds/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const client = req.app.get('client');
    
    // Query parameters for filtering and pagination
    const { 
      includeMembers = 'true', 
      includeRoles = 'true',
      includeChannels = 'true',
      memberLimit = '100',
      memberOffset = '0'
    } = req.query;
    
    // Parse boolean and numeric parameters
    const shouldIncludeMembers = includeMembers === 'true';
    const shouldIncludeRoles = includeRoles === 'true';
    const shouldIncludeChannels = includeChannels === 'true';
    const limit = parseInt(memberLimit, 10);
    const offset = parseInt(memberOffset, 10);
    
    // Kiểm tra guild trong Discord
    const discordGuild = client.guilds.cache.get(id);
    if (!discordGuild) {
      return res.status(404).json({ error: 'Guild not found' });
    }
    
    // Lấy thông tin từ database
    let dbGuild = await prisma.guild.findUnique({
      where: { id },
      include: {
        commands: true
      }
    });
    
    // Tạo guild trong database nếu chưa có
    if (!dbGuild) {
      dbGuild = await prisma.guild.create({
        data: {
          id,
          name: discordGuild.name,
          prefix: '!'
        },
        include: {
          commands: true
        }
      });
    }
    
    // Calculate member status counts
    const memberStatusCounts = {
      online: 0,
      idle: 0,
      dnd: 0,
      offline: 0
    };
    
    discordGuild.members.cache.forEach(member => {
      const status = member.presence?.status || 'offline';
      if (memberStatusCounts[status] !== undefined) {
        memberStatusCounts[status]++;
      }
    });
    
    // Get activities data
    const activities = new Map();
    discordGuild.members.cache.forEach(member => {
      if (member.presence?.activities) {
        member.presence.activities.forEach(activity => {
          if (!activities.has(activity.type)) {
            activities.set(activity.type, 0);
          }
          activities.set(activity.type, activities.get(activity.type) + 1);
        });
      }
    });
    
    // Convert activities map to object
    const activitySummary = {};
    activities.forEach((count, type) => {
      activitySummary[type] = count;
    });
    
    // Prepare members data with pagination
    let membersData = [];
    if (shouldIncludeMembers) {
      const members = Array.from(discordGuild.members.cache.values());
      const paginatedMembers = members.slice(offset, offset + limit);
      
      membersData = paginatedMembers.map(member => ({
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        nickname: member.nickname,
        avatar: member.user.displayAvatarURL(),
        roles: member.roles.cache.map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position
        })),
        joinedAt: member.joinedAt,
        status: member.presence?.status || 'offline',
        bot: member.user.bot,
        activities: member.presence?.activities?.map(activity => ({
          name: activity.name,
          type: activity.type,
          details: activity.details,
          state: activity.state,
          createdAt: activity.createdAt
        })) || []
      }));
    }
    
    // Prepare roles data
    let rolesData = [];
    if (shouldIncludeRoles) {
      rolesData = Array.from(discordGuild.roles.cache.values())
        .sort((a, b) => b.position - a.position)
        .map(role => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position,
          managed: role.managed,
          permissions: role.permissions.toArray(),
          memberCount: discordGuild.members.cache.filter(member => 
            member.roles.cache.has(role.id)
          ).size
        }));
    }
    
    // Prepare channels data by category
    let channelsData = {};
    if (shouldIncludeChannels) {
      // Group channels by category
      const categories = discordGuild.channels.cache.filter(channel => channel.type === 4);
      
      // Add uncategorized channels
      channelsData["uncategorized"] = {
        id: null,
        name: "Uncategorized",
        channels: discordGuild.channels.cache
          .filter(channel => channel.type !== 4 && !channel.parentId)
          .map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position,
            nsfw: channel.nsfw,
            createdAt: channel.createdAt
          }))
      };
      
      // Add channels by category
      categories.forEach(category => {
        const categoryChannels = discordGuild.channels.cache
          .filter(channel => channel.parentId === category.id)
          .map(channel => ({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position,
            nsfw: channel.nsfw,
            createdAt: channel.createdAt
          }));
        
        channelsData[category.id] = {
          id: category.id,
          name: category.name,
          position: category.position,
          channels: categoryChannels
        };
      });
    }
    
    // Gộp thông tin
    const guild = {
      id: discordGuild.id,
      name: discordGuild.name,
      memberCount: discordGuild.memberCount,
      icon: discordGuild.iconURL(),
      prefix: dbGuild.prefix,
      commands: dbGuild.commands,
      createdAt: discordGuild.createdAt,
      features: discordGuild.features,
      verificationLevel: discordGuild.verificationLevel,
      description: discordGuild.description,
      vanityURLCode: discordGuild.vanityURLCode,
      banner: discordGuild.bannerURL(),
      splash: discordGuild.splashURL(),
      
      // Enhancement: Stats and counts
      stats: {
        members: {
          total: discordGuild.memberCount,
          online: memberStatusCounts.online,
          idle: memberStatusCounts.idle,
          dnd: memberStatusCounts.dnd,
          offline: memberStatusCounts.offline,
          active: memberStatusCounts.online + memberStatusCounts.idle + memberStatusCounts.dnd,
          botCount: discordGuild.members.cache.filter(member => member.user.bot).size,
          humanCount: discordGuild.members.cache.filter(member => !member.user.bot).size
        },
        channels: {
          total: discordGuild.channels.cache.size,
          text: discordGuild.channels.cache.filter(channel => channel.type === 0).size,
          voice: discordGuild.channels.cache.filter(channel => channel.type === 2).size,
          category: discordGuild.channels.cache.filter(channel => channel.type === 4).size,
          forum: discordGuild.channels.cache.filter(channel => channel.type === 15).size,
          announcement: discordGuild.channels.cache.filter(channel => channel.type === 5).size
        },
        roles: {
          total: discordGuild.roles.cache.size,
          manageable: discordGuild.roles.cache.filter(role => role.managed).size
        },
        emojis: {
          total: discordGuild.emojis.cache.size,
          animated: discordGuild.emojis.cache.filter(emoji => emoji.animated).size,
          static: discordGuild.emojis.cache.filter(emoji => !emoji.animated).size
        },
        stickers: {
          total: discordGuild.stickers?.cache.size || 0
        },
        activitySummary
      },
      
      // Detailed data sections
      members: shouldIncludeMembers ? {
        data: membersData,
        pagination: {
          total: discordGuild.members.cache.size,
          limit,
          offset,
          hasMore: offset + limit < discordGuild.members.cache.size
        }
      } : undefined,
      
      roles: shouldIncludeRoles ? rolesData : undefined,
      channels: shouldIncludeChannels ? channelsData : undefined,
      
      // List of emojis and stickers
      emojis: discordGuild.emojis.cache.map(emoji => ({
        id: emoji.id,
        name: emoji.name,
        animated: emoji.animated,
        url: emoji.url
      })),
      
      stickers: discordGuild.stickers?.cache.map(sticker => ({
        id: sticker.id,
        name: sticker.name,
        description: sticker.description,
        format: sticker.format,
        url: sticker.url
      })) || []
    };
    
    res.json(guild);
  } catch (error) {
    logger.error(`Error fetching guild ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API cập nhật prefix của server
router.patch('/guilds/:id/prefix', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { prefix } = req.body;
    
    if (!prefix) {
      return res.status(400).json({ error: 'Prefix is required' });
    }
    
    // Cập nhật trong database
    const guild = await prisma.guild.update({
      where: { id },
      data: { prefix }
    });
    
    res.json(guild);
  } catch (error) {
    logger.error(`Error updating guild ${req.params.id} prefix:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get guild members with pagination and search
router.get('/guilds/:id/members', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      limit = '50', 
      offset = '0',
      search = '',
      role = '',
      status = ''
    } = req.query;
    
    // Parse query parameters
    const memberLimit = parseInt(limit, 10);
    const memberOffset = parseInt(offset, 10);
    
    const client = req.app.get('client');
    const discordGuild = client.guilds.cache.get(id);
    
    if (!discordGuild) {
      return res.status(404).json({ error: 'Guild not found' });
    }
    
    // Filter members based on query parameters
    let members = Array.from(discordGuild.members.cache.values());
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      members = members.filter(member => 
        member.user.username.toLowerCase().includes(searchLower) ||
        (member.nickname && member.nickname.toLowerCase().includes(searchLower)) ||
        member.user.id.includes(search)
      );
    }
    
    // Apply role filter if provided
    if (role) {
      members = members.filter(member => member.roles.cache.has(role));
    }
    
    // Apply status filter if provided
    if (status) {
      members = members.filter(member => member.presence?.status === status);
    }
    
    // Apply pagination
    const total = members.length;
    const paginatedMembers = members.slice(memberOffset, memberOffset + memberLimit);
    
    // Format member data
    const membersData = paginatedMembers.map(member => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      nickname: member.nickname,
      avatar: member.user.displayAvatarURL(),
      roles: member.roles.cache.map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor,
        position: role.position
      })),
      joinedAt: member.joinedAt,
      status: member.presence?.status || 'offline',
      bot: member.user.bot,
      activities: member.presence?.activities?.map(activity => ({
        name: activity.name,
        type: activity.type,
        details: activity.details,
        state: activity.state,
        createdAt: activity.createdAt
      })) || []
    }));
    
    res.json({
      members: membersData,
      pagination: {
        total,
        limit: memberLimit,
        offset: memberOffset,
        hasMore: memberOffset + memberLimit < total
      }
    });
  } catch (error) {
    logger.error(`Error fetching guild members for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
