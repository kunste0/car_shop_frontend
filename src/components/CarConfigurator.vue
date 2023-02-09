<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="article in articles" :key="article.articleNumber">
        {{ article }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import { api } from '../boot/axios';
import { Article } from './models';



export default defineComponent({
  name: 'CarConfigurator',
  props: {
    title: {
      type: String,
      required: true
    },
    active: {
      type: Boolean
    }
  },
  data() {
    return {
      articles: [] as Array<Article>
    };
  },
  async mounted() {
    api.get('/article')
      .then((articles => {
        this.articles = articles.data
      }));
  }
});
</script>
