<template>
  <div class="card" :class="cardClass">
    <div v-if="title || $slots.header" class="card-header" :class="headerClass">
      <div class="d-flex align-items-center justify-content-between">
        <h5 v-if="title" class="mb-0">{{ title }}</h5>
        <slot name="header"></slot>
      </div>
    </div>
    <div class="card-body" :class="bodyClass">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer" :class="footerClass">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    headerClass: {
      type: String,
      default: ''
    },
    bodyClass: {
      type: String,
      default: ''
    },
    footerClass: {
      type: String,
      default: ''
    },
    cardClass: {
      type: String,
      default: ''
    }
  }
}
</script>
