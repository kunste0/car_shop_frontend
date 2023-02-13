<template>
  <p class="text-weight-bold">{{ text }}</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Headline',
  props: {
    text: {
      type: String,
      required: true,
    },
  },
});
</script>
