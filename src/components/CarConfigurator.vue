<template>
  <div>
    <p>{{ title }}</p>
    <div class="q-pa-lg">
      <div v-for="(articles, type) in articlesGrouped" :key="type">
        <p>{{ $t('configurator.articleType' + type) }}</p>
        <div v-if="type == 3">
          <q-select
            filled
            v-model="chosenArticles2"
            multiple
            :options="
              articles.map((article) => {
                return {
                  label: article.articleName,
                  value: article.articleNumber,
                };
              })
            "
            :max-values="constants.miscArticlesMax"
            counter
            :hint="
              $t('configurator.maxArticles', {
                max: constants.miscArticlesMax,
              })
            "
            style="width: 250px"
          />
        </div>
        <div v-else>
          <q-list v-for="article in articles" :key="article.articleNumber">
            <q-item tag="label" v-ripple>
              <q-item-section avatar>
                <q-radio
                  v-model="chosenArticles[article.articleType]"
                  :val="article.articleNumber"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ article.articleName }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <p>{{ price }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import {
  QItem,
  QItemLabel,
  QItemSection,
  QList,
  QRadio,
  QSelect,
} from 'quasar';
import { defineComponent, ref } from 'vue';
import { api } from '../boot/axios';
import { Article } from './models';
import _ from 'lodash-core';
import { Dictionary } from 'express-serve-static-core';
import { constants } from '../constants';

interface Options {
  label: string;
  value: number;
}

export default defineComponent({
  name: 'CarConfigurator',
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  components: {
    QItem,
    QItemLabel,
    QItemSection,
    QList,
    QRadio,
    QSelect,
  },
  data() {
    return {
      chosenArticles: ref([] as Array<number>),
      chosenArticles2: ref([] as Array<Options>),
      articles: [] as Array<Article>,
      articlesGrouped: {} as Dictionary<Array<Article>>,
      constants,
    };
  },
  computed: {
    price() {
      const articlesTemp = this.chosenArticles2.map((option) => option.value);
      const articles = [...this.chosenArticles, ...articlesTemp];
      const prices = articles.map(
        (chosenArticleNumber) =>
          this.articles.find(
            (article) => article.articleNumber === chosenArticleNumber
          )?.articlePrice ?? 0
      );

      return _.sum(prices);
    },
  },
  async mounted() {
    api.get('/article').then((response) => {
      this.articles = response.data;
      this.articlesGrouped = _.groupBy(
        this.articles,
        (article: Article) => article.articleType
      );

      // set the default choices
      Object.entries(this.articlesGrouped).forEach(([key, value]) => {
        this.chosenArticles[Number.parseInt(key)] = value[0].articleNumber;
      });
    });
  },
});
</script>
