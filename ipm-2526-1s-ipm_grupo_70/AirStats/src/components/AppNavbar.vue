<template>
  <nav class="w-full h-20 bg-blue text-white px-8 py-3 flex items-center shadow-md">
    <!-- Left Logo -->
    <div class="w-1/4">
      <img
        src="../assets/airStatsLogo.svg"
        alt="AirStats logo"
        class="h-10 cursor-pointer"
        @click="goHome()"
      />
    </div>

    <!-- Navigation Items -->
    <ul class="flex items-center gap-30 text-lg font-medium w-3/4">
      <li
        v-for="item in menu"
        :key="item.name"
        @click="select(item)"
        class="cursor-pointer relative hover:opacity-80"
      >
        <span>{{ item.label }}</span>

        <!-- Active underline -->
        <div
          v-if="item.path === active"
          class="absolute left-0 right-0 -bottom-1 h-[3px] bg-white rounded-full"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionStorage } from '@/stores/session.ts'

const router = useRouter()
const route = useRoute()

const session = useSessionStorage()

const active = ref(route.path)

const menu = [
  { name: 'stats', label: 'Estatísticas', path: '/Statistics' },
  { name: 'irregularities', label: 'Anomalias', path: '/Irregularities' },
  { name: 'comparison', label: 'Comparar', path: '/Comparisons' },
]

function select(item) {
  active.value = item.path
  router.push(item.path)
}

function goHome() {
  session.exitHome()
  router.push('/')
}
</script>
