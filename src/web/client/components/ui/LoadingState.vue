<template>
  <div class="text-center p-5">
    <div class="spinner-border" :class="spinnerClass" role="status">
      <span class="visually-hidden">{{ message }}</span>
    </div>
    <p class="mt-2">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoadingState',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    },
    spinnerClass: {
      type: String,
      default: 'text-primary'
    }
  }
}
</script>
