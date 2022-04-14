<template>
    <div class="w-20 bg-red-600">
        <div v-if="dnd == null" class="bg-gray-300 cursor-wait select-none w-full h-full p-2">
            <span>Loading...</span>
        </div>
        <div v-else>
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
    </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, Ref, ref } from 'vue'

import { Addon, Graph, Node } from "@antv/x6";
import { Dnd } from '@antv/x6/lib/addon/dnd';

import { elements } from './concept_1';

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

    const target = e.currentTarget as HTMLDivElement
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
