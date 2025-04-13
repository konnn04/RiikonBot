import { EmbedBuilder } from "discord.js";

export const TYPE = {
    INFO: {
        name: "info",
        color: "#00FF00",
        emoji: "ℹ️",
    },
    ERROR: {
        name: "error",
        color: "#FF0000",
        emoji: "❌",
    },
    WARNING: {
        name: "warning",
        color: "#FFA500",
        emoji: "⚠️",
    },
    SUCCESS: {
        name: "success",
        color: "#008000",
        emoji: "✅",
    },
    DEFAULT: {
        name: "default",
        color: "#0000FF",
        emoji: "🔵",
    },
    PLAYING: {
        name: "playing",
        color: "#FFA500",
        emoji: "🎶",
    },
    QUEUE: {
        name: "queue",
        color: "#FFA500",
        emoji: "🎶",
    },
    PAUSED: {
        name: "paused",
        color: "#FFA500",
        emoji: "⏸️",
    },
    RESUMED: {
        name: "resumed",
        color: "#FFA500",
        emoji: "▶️",
    },
    SKIPPED: {
        name: "skipped",
        color: "#FFA500",
        emoji: "⏭️",
    },
    STOPPED: {
        name: "stopped",
        color: "#FFA500",
        emoji: "⏹️",
    },
    SEARCHING : {
        name: "searching",
        color: "#FFA500",
        emoji: "🔍",
    },
    TIMEOUT: {
        name: "timeout",
        color: "#FFA500",
        emoji: "⏳",
    },
};

export class Embed {
    constructor() {
        this.embed = new EmbedBuilder()
        .setColor(TYPE.DEFAULT.color)
        .setTitle("Hi there!")
        .setDescription("This is a default embed message.")
        .setTimestamp();
    }
    
    static notify(title, description, type = TYPE.DEFAULT) {
        return new EmbedBuilder()
            .setColor(type.color)
            .setTitle(`${type.emoji} ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    static infoMusicPlaying(title, author, duration = "N/A", thumbnail, url = null, orderBy, left = '?') {
        const e = new EmbedBuilder()
            .setColor(TYPE.PLAYING.color)
            .setTitle(`${TYPE.PLAYING.emoji} Now Playing`)
            .setDescription(`**${title}** \n${author} `)
            .setFields([
                { name: "Order By", value: orderBy || "Unknown", inline: true },
                { name: "Duration", value: duration, inline: true },
                { name: "Left", value: left, inline: true },
            ])
            .setThumbnail(thumbnail)
            .setFooter({ text: `Use /play to add more songs ^.^` })
            .setTimestamp();
        if (url) e.setURL(url);
        return e;
    }

    static addedToQueue(title, author, duration = "N/A", thumbnail, url = null, orderBy, left = '?') {
        const e = new EmbedBuilder()
            .setColor(TYPE.SKIPPED.color)
            .setTitle(`${TYPE.SKIPPED.emoji} Added to Queue`)
            .setDescription(`**${title}** \n${author} `)
            .setFields([
                { name: "Order By", value: orderBy || "Unknown", inline: true },
                { name: "Duration", value: duration, inline: true },
                { name: "Left", value: left, inline: true },
            ])
            .setThumbnail(thumbnail)
            .setFooter({ text: `Use /play to add more songs ^.^` })
            .setTimestamp();
        if (url) e.setURL(url);
        return e;
    }

    static skipMusic(title, author, thumbnail, orderBy) {
        return new EmbedBuilder()
            .setColor(TYPE.SKIPPED.color)
            .setTitle(`${TYPE.SKIPPED.emoji} Skipped`)
            .setDescription(`**Title:** ${title}\n**Author:** ${author}`)
            .setThumbnail(thumbnail)
            .setFooter({ text: `Use /play to add more songs ^.^` })
            .setTimestamp();
    }

    static showQueue(queueSong, isLoop = false, volume = 100) {
        const queueEmbed = []
        if (queueSong.length > 1) {
            const upcomingSongs = queueSong.slice(1, 11).map((song, index) => 
                `${index + 1}. ${song.title} (${song.duration})`
            ).join('\n');
            queueEmbed.push({ name: "Upcoming Songs:", value: upcomingSongs || "No upcoming songs" });

            // Add total count if there are more songs
            if (queueSong.length > 11) {
                queueEmbed.push({ name: "Total Songs:", value: `${queueSong.length} songs in queue`, inline: true });
            }
        }   

        queueEmbed.push(
            isLoop ?
            { name: "Loop:", value: "✅ Enabled", inline: true }:
            { name: "Loop:", value: "❌ Disabled", inline: true }
        );
        queueEmbed.push({ name: "Volume:", value: `${volume}%`, inline: true });

        if (!queueSong || queueSong.length === 0) return null;
        const e = new EmbedBuilder()
            .setColor(TYPE.QUEUE.color)
            .setTitle(`${TYPE.QUEUE.emoji} Music Queue`)
            .setDescription(`**Now Playing:**\n${queueSong[0].title} (${queueSong[0].duration})`)
            .setThumbnail(queueSong[0].thumbnail || "https://i.imgur.com/vvHdphW.png")
            .setFields(queueEmbed)
            .setFooter({ text: `Use /skip to skip songs ^.^` })
            .setTimestamp();
        return e;
    }

    static showSearchResults(results, query, timeout = 30) {
        const resultText = results.map((song, index) => 
            `**${index + 1}.** ${song.title} (${song.duration}) by *${song.author}*`
          ).join('\n\n');
        const timestamp = Math.floor(Date.now() / 1000) + timeout;
        const e = new EmbedBuilder()
            .setColor(TYPE.SEARCHING.color)
            .setTitle(`${TYPE.SEARCHING.emoji} Search Results`)
            .setDescription(`**Search Query:** ${query}\n\n${resultText}`)
            .setFields([
                { name: "Timeout:", value: `<t:${timestamp}:R>`, inline: true },
                { name: "Select:", value: `1-${results.length}`, inline: true },
            ])
            .setFooter({ text: `Use /play to add more songs ^.^` })
            .setTimestamp();
        return e;
    }
    
}