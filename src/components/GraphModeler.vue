<template>
    <div class="flex justify-center bg-gray-200 py-4">
        <div class="relative h-full" id="modeler-container"></div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, Ref, ref } from 'vue'

import { Addon, Graph } from "@antv/x6";
import { Dnd } from '@antv/x6/lib/addon/dnd';

const graph: Ref<Graph | null> = ref(null);
const dnd: Ref<Dnd | null> = ref(null);

function initModeler(container: HTMLElement) {
    // graph-quiz: https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue
    // stencil example: https://codesandbox.io/s/m9fzwi

    let width = container.scrollWidth;
    let height = container.scrollHeight || 500;

    graph.value = new Graph({
        container,
        width,
        height,
        grid: true,

        background: {
            color: 'white'
        },

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

function initExampleNodes() {
    const path = graph.value?.addNode({
        shape: 'polygon',
        x: graph.value.options.width/2,
        y: graph.value.options.height/2,
        width: 80,
        height: 80,
        points: '26.934,1.318 35.256,18.182 53.867,20.887 40.4,34.013 43.579,52.549 26.934,43.798 10.288,52.549 13.467,34.013 0,20.887 18.611,18.182',
        attrs: {
            body: {
                stroke: 'black',
            },
        },
    })

    console.log("test", graph.value, path)
}

function initDnd(graph: Graph) {
    dnd.value = new Addon.Dnd({
        target: graph,
        scaled: false,
    })
}


onMounted(() => {
    
    const container = document.getElementById("modeler-container");
    if (container != null)
    {
        initModeler(container)
        if (graph.value != null)
        {
            initDnd(graph.value)
            // initExampleNodes()
        }
    }
    else
    {
        console.error("Container is null")
    }
})

// return {

// }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

#modeler-container {
    width: 800px;
    height: 600px;
    // background-color: red;
}
</style>
