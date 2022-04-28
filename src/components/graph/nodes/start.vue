<template>

    <div class="bg-red-500 block">
        <span>{{ node.getAttrByPath('text/text') }} asd</span>
    </div>

</template>

<script lang="ts" setup>
    import { Graph, Node } from '@antv/x6'
    import { inject, onMounted } from 'vue'

    import GraphModeler from './GraphModeler.vue'

    onMounted(() => {
        console.log('Editor window mounted.')
        // this.remote_graph_data_reload();
    });

    const getGraph = inject<() => Graph>('getGraph');
    const getNode = inject<() => Node>('getNode');

    const graph = getGraph!();
    const node = getNode!();
   
    node.on("change:*", ({ current }) => {
        node.
    });

</script>