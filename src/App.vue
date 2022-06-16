<template>
    <div class="">
        <GraphEditorComponent />
    </div>
</template>

<script lang="ts" setup>
import { defineComponent } from 'vue';
// import GraphModeler from './components/GraphModeler.vue';
import GraphEditorComponent from './components/graph/GraphEditorComponent.vue';
import Test from './components/Test.vue';
</script>

<style lang="scss">
#app {
    margin: 1rem;
    margin-top: 30px;
}

</style>
