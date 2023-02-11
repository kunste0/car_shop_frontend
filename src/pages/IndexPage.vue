<template>
  <q-page class="row items-center justify-evenly" padding>
    <car-configurator :title="$t('configurator.title')"></car-configurator>
  </q-page>
</template>

<script lang="ts">
import CarConfigurator from 'src/components/CarConfigurator.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  components: { CarConfigurator },
});
</script>
