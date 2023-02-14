import { defineStore } from 'pinia';
import { LocationQueryValue } from 'vue-router';
import { api } from '../boot/axios';
import { Article } from '../components/models';

export const useConfiguratorStore = defineStore('configurator', {
  state: () => ({
    articles: [] as Array<Article>,
    orderArticles: [] as Array<Article>,
  }),
  getters: {
    getArticles: (state) => state.articles,
    getOrderArticles: (state) => state.orderArticles,
  },
  actions: {
    async fetchArticles() {
      try {
        const response = await api.get('/article');
        this.articles = response.data;
      } catch (error) {
        console.log(error);
      }
    },
    async fetchOrderArticles(id: string | LocationQueryValue[]) {
      try {
        const response = await api.get('/order/link/' + id);
        this.orderArticles = response.data.articles;
      } catch (error) {
        console.log(error);
      }
    },
  },
});
