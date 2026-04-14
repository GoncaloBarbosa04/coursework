import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/Statistics',
      name: 'Statistics',
      component: () => import('../views/StatisticsView.vue'),
    },
    {
      path: '/Irregularities',
      name: 'Irregularities',
      component: () => import('../views/IrregularitiesView.vue'),
    },
    {
      path: '/Comparisons',
      name: 'Comparisons',
      component: () => import('../views/ComparisonsView.vue'),
    },
  ],
})

export default router
