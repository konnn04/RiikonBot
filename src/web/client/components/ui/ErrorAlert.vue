<template>
  <div class="alert alert-danger">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>
