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
    
}