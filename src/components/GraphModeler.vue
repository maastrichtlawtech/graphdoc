<template>
    <div class="flex">
        <div>sss</div>
        <div class="relative h-full" id="modeler-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'

import { Graph } from "@antv/x6";
// import "@antv/x6-vue-shape";

function initModeler() {
    // https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue

    const container = document.getElementById("modeler-container");
    if (container == null)
        return;

    let width = container.scrollWidth;
    let height = container.scrollHeight || 500;

    const graph = new Graph({
        container,
        width,
        height,
        grid: true,

        mousewheel: {
            enabled: true,
            modifiers: ['ctrl', 'meta'],
        },
        scroller: {
            enabled: true,
            pannable: true,
        },
    });

}

onMounted(() => {
    initModeler()
})

// return {

// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
