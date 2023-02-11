<template>
  <div class="configurator">
    <p class="text-weight-bold">{{ title }}</p>
    <div v-for="(articles, type) in articlesGrouped" :key="type">
      <q-expansion-item
        expand-separator
        :label="$t('configurator.articleType' + type)"
      >
        <div v-if="constants.selectionCategories.includes(Number(type))">
          <q-select
            class="q-my-sm"
            filled
            :popup-content-style="{ width: '320px' }"
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
            style="max-width: 12rem"
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
      </q-expansion-item>
    </div>
    <div class="q-my-md">
      <p class="text-positive text-weight-bold">
        {{ `${$t('configurator.price')}: ${price} €` }}
      </p>

      <div class="row justify-center items-center">
        <q-btn
          color="primary"
          :label="$t('configurator.submitOrderButton')"
          @click="submitOrder"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api } from '../boot/axios';
import { Article } from './models';
import sum from 'lodash/sum';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import { Dictionary } from 'express-serve-static-core';
import { constants } from '../constants';
import { v4 as uuidv4 } from 'uuid';

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
  data() {
    return {
      chosenArticles: ref([] as Array<number>),
      chosenArticles2: ref([] as Array<Options>),
      articles: [] as Array<Article>,
      articlesGrouped: {} as Dictionary<Array<Article>>,
      constants,
    };
  },
  methods: {
    submitOrder() {
      const configuration = uuidv4();
      this.$router.replace({
        query: { configuration },
      });
      api.post('/order', {
        articleNumbers: [
          ...this.chosenArticles,
          ...this.chosenArticles2.map((option) => option.value),
        ],
        link: configuration,
      });
    },
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

      return (sum(prices) / 100).toFixed(2);
    },
  },
  async mounted() {
    const response = await api.get('/article');
    this.articles = response.data;
    this.articlesGrouped = groupBy(
      this.articles,
      (article: Article) => article.articleType
    );

    // sets the default choices
    if (!this.$route.query.configuration) {
      Object.entries(this.articlesGrouped).forEach(([key, value]) => {
        if (!this.constants.selectionCategories.includes(Number(key)))
          this.chosenArticles[Number.parseInt(key)] =
            head(value)?.articleNumber ?? 0;
      });
    } else {
      const response = await api.get(
        '/order/link/' + this.$route.query.configuration
      );
      const articles: Array<Article> = response.data.articles;
      articles.forEach((article, index) => {
        if (!this.constants.selectionCategories.includes(article.articleType)) {
          this.chosenArticles[index] = article.articleNumber;
        } else {
          this.chosenArticles2[index - article.articleType] = {
            label: article.articleName,
            value: article.articleNumber,
          };
        }
      });
    }
  },
});
</script>

<style>
.configurator {
  min-width: 12rem;
}
</style>
