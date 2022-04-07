<template>
    <div class="w-64 h-32 bg-red-500">
        <GraphModeler />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GraphModeler from './components/GraphModeler.vue';

export default defineComponent({
    name: 'App',
    components: {
        GraphModeler
    }
});
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
