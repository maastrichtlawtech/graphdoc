<template>
    <div class="w-16 bg-red-600" :class="{'bg-gray-600 border border-red-600': (graph != null)}">
        <div class="shape" data-type="start" @mousedown="startDrag($event)">
            Start
        </div>
        <div class="shape" data-type="decision" @mousedown="startDrag($event)">
            Decision
        </div>
        <div class="shape" data-type="notice" @mousedown="startDrag($event)">
            Notice
        </div>
        <div class="shape" data-type="end" @mousedown="startDrag($event)">
            End
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, Ref, ref } from 'vue'

import { Addon, Graph, Node } from "@antv/x6";
import { Dnd } from '@antv/x6/lib/addon/dnd';

// const props = defineProps<{
//     graph: Ref<Graph | null>,
//     // elements: {[key: string]: {shape: string, points: string}}
// }>()

// props.graph.value?.addNode() 

const elements: {[key: string]: {antv_metadata: Node.Metadata}} = {
    'start': {
        'antv_metadata': {
            'shape': 'polygon',
            'points': '0,10 10,0 20,10 10,20',
        }
    },
    'decision': {
        'antv_metadata': {
            'shape': 'polygon',
            'points': '0,10 10,0 20,10 10,20',
        }
    }
}

const dnd: Ref<Dnd | null> = ref(null);
const graph: Ref<Graph | null> = ref(null);

function initDnd(graph_arg: Graph) {
    graph.value = graph_arg;

    dnd.value = new Addon.Dnd({
        target: graph.value,
        scaled: false,
    })
}

function startDrag(e: Event) {
    if (graph.value == null)
        return;

    const target = <HTMLDivElement>e.currentTarget
    const type = target.getAttribute('data-type')!
    
    if (!(type in Object.keys(elements))) {
        throw Error("Element does not exist")
    }

    const node = graph.value.createNode(elements[type].antv_metadata);
    // node.label = type
    alert('ay')
    console.log(node);
    dnd.value?.start(node, e);
}

onMounted(() => {
    // call init from modelers
    // initDnd(graph.value)

})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
