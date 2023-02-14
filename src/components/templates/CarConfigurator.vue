<template>
  <div class="configurator">
    <headline :text="title" />
    <div v-for="(articles, type) in articlesGrouped" :key="type">
      <q-expansion-item
        expand-separator
        :label="$t('configurator.articleType' + type)"
      >
        <div v-if="constants.selectionCategories.includes(Number(type))">
          <option-select
            :articles="articles"
            :preSelected="preSelectArticles(Number(type), articles.length)"
            style="max-width: 14rem"
            @add="addChosenArticle"
            @remove="removeChosenArticle"
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
    <div>
      <p class="text-positive text-weight-bold">
        {{ `${$t('configurator.price')}: ${price}` }}
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
import { defineComponent } from 'vue';
import { api } from 'boot/axios';
import { Article, SelectableOption } from '../models';
import sum from 'lodash/sum';
import groupBy from 'lodash/groupBy';
import head from 'lodash/head';
import { Dictionary } from 'express-serve-static-core';
import { constants } from '../../constants';
import { v4 as uuidv4 } from 'uuid';
import { useConfiguratorStore } from '../../stores/configurator-store';

import Headline from '../atoms/Headline.vue';
import OptionSelect from '../organisms/OptionSelect.vue';

const formatter = new Intl.NumberFormat(navigator.language, {
  style: 'currency',
  currency: constants.currency,
});

const store = useConfiguratorStore();

export default defineComponent({
  name: 'CarConfigurator',
  components: {
    OptionSelect,
    Headline,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      chosenArticles: [] as Array<number>, // holds article numbers of the chosen articles
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
        articleNumbers: this.chosenArticles,
        link: configuration,
      });
    },
    preSelectArticles(start: number, end: number) {
      return this.chosenArticles.slice(start, start + end);
    },
    addChosenArticle(item: { index: number; value: SelectableOption }) {
      this.chosenArticles.push(item.value.value);
    },
    removeChosenArticle(item: { index: number; value: SelectableOption }) {
      this.chosenArticles = this.chosenArticles.filter(
        (articleNumber) => articleNumber !== item.value.value
      );
    },
  },
  computed: {
    price() {
      const prices = this.chosenArticles.map(
        (chosenArticleNumber) =>
          this.articles.find(
            (article) => article.articleNumber === chosenArticleNumber
          )?.articlePrice ?? 0
      );
      const priceSum = sum(prices) / 100;

      return formatter.format(priceSum);
    },
    articles() {
      return store.articles;
    },
  },
  async mounted() {
    await store.fetchArticles();
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
      await store.fetchOrderArticles(this.$route.query.configuration);
      store.getOrderArticles.forEach((article) => {
        this.chosenArticles.push(article.articleNumber);
      });
    }
  },
});
</script>

<style>
.configurator {
  min-width: 14rem;
}
</style>
