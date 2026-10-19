<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import Breadcrumb from './components/Breadcrumb.vue'
import PrereqBar from './components/PrereqBar.vue'
import PrereqDrawer from './components/PrereqDrawer.vue'
import NotFound from './components/NotFound.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <Breadcrumb />
      <PrereqBar />
    </template>
    <template #not-found>
      <NotFound />
    </template>
  </DefaultTheme.Layout>
  <PrereqDrawer />
</template>
