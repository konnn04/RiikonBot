<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h1>{{ title }}</h1>
    <slot name="actions"></slot>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>
