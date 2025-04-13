<template>
    <span class="text-copy-wrapper" @mouseenter="showCopyIcon = true" @mouseleave="showCopyIcon = false">
        <span class="text-copy-content" :class="{ 'copied': copied }">{{ text }}</span>
        <button v-show="showCopyIcon || copied" class="copy-button" @click="copyToClipboard"
            :title="copied ? 'Copied!' : 'Copy to clipboard'">
            <i :class="copied ? 'bi bi-check-lg' : 'bi bi-clipboard'"></i>
        </button>
    </span>
</template>

<script>
export default {
    name: 'TextCopy',
    props: {
        text: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            showCopyIcon: false,
            copied: false
        }
    },
    methods: {
        copyToClipboard() {
            navigator.clipboard.writeText(this.text)
                .then(() => {
                    this.copied = true;
                    setTimeout(() => {
                        this.copied = false;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    }
}
</script>

<style scoped>
.text-copy-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    transition: padding-right 0.2s ease;
}

.text-copy-wrapper:hover {
    padding-right: 24px;
}

.text-copy-content {
    padding: 2px 4px;
    border-radius: 3px;
    transition: background-color 0.2s ease;
    cursor: pointer;
}



.text-copy-content.copied {
    background-color: rgba(40, 167, 69, 0.2);
}

.copy-button {
    position: absolute;
    right: 0;
    bottom: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: var(--text-muted, #6c757d);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.copy-button:hover {
    opacity: 1;
}

/* Dark theme support */
/* :root.dark-theme .text-copy-content {
  background-color: rgba(255, 255, 255, 0.1);
} */

:root.dark-theme .text-copy-content.copied {
    background-color: rgba(40, 167, 69, 0.3);
}
</style>
