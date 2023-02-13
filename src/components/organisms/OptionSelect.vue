<template>
  <q-select
    filled
    v-model="articleModel"
    multiple
    :options="options"
    :max-values="constants.miscArticlesMax"
    counter
    :hint="
      $t('configurator.maxArticles', {
        max: constants.miscArticlesMax,
      })
    "
    :style="style"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { constants } from '../../constants';
import { Article, SelectableOption } from '../models';

export default defineComponent({
  name: 'OptionSelect',
  props: {
    articles: {
      type: Array<Article>,
      required: true,
    },
    preSelected: {
      type: Array<number>,
      default: [],
    },
    style: {
      type: Object,
    },
  },
  data() {
    return {
      options: [] as Array<SelectableOption>,
      constants,
    };
  },
  computed: {
    chosenArticles() {
      return this.articleModel.map((option) => option.value);
    },
    articleModel() {
      return this.options.filter((option: SelectableOption) =>
        this.preSelected.includes(option.value)
      );
    },
  },
  watch: {},
  mounted() {
    this.options = this.articles.map((article) => {
      return {
        label: article.articleName,
        value: article.articleNumber,
      };
    });
  },
});
</script>
