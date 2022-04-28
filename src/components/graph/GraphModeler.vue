<template>

    <div class="border border-gray-400 rounded overflow-hidden">
        <div class="w-full bg-gray-100 ">
            <!-- <GraphModelerToolbar v-if="graph !== null" 
                :remote_graph_data="remote_graph_data" 
                :graph="graph" 
                :remote_graph_data_reload="remote_graph_data_reload"
                :local_save="local_save">
            </GraphModelerToolbar> -->

            <GraphModelerToolbar
                :graph="graph" 
                :docassemble_cont_update="docassemble_cont_update"
                 />
        </div>
        <div class="w-full flex" style="height: 500px;">
            <div class="w-20 bg-gray-100 border-t  border-gray-200">
                <GraphModelerElementsBar v-if="graph !== null" :graph="graph"></GraphModelerElementsBar>
            </div>
            <div class="w-32 flex-grow border border-b-0 border-gray-200">
                <div class="relative h-full" id="modeler-container"></div>
            </div>
            <div class="w-64 bg-gray-100 border-t border-gray-200 overflow-y-auto">
                <GraphModelerConfigBar :default_edge_label="default_edge_label" :cell="selected_cell"></GraphModelerConfigBar>
            </div>
        </div>
    </div>
    <div class="mt-4">
        <span>Docassemble out:</span>
        <div class="w-full min-h-4 font-mono border p-2 mt-1 whitespace-pre-wrap">
            {{ docassemble_cont }}
        </div>
    </div>

</template>

<script lang="ts" setup>

    import { computed, onMounted, Ref, ref, watch } from 'vue';

    import { useToast } from "vue-toastification";

    import axios from 'axios';
    import { Cell, Graph } from '@antv/x6';

    import GraphModelerConfigBar from './GraphModelerConfigBar.vue'
    import GraphModelerElementsBar from './GraphModelerElementsBar.vue'
    import GraphModelerToolbar from './GraphModelerToolbar.vue'
    
    import Transformer from '@/utils/transformer'
    import { graph_options_defaults, graph_register_defaults } from '@/utils/model'

    const toast = useToast();

    onMounted(() => {
        init_modeler()
    })

    const graph_data: Ref<object> = ref({});
    const graph: Ref<Graph | undefined> = ref();

    const selected_cell: Ref<Cell | undefined> = ref();

    const default_edge_label = (text = '') => {
        return {
            attrs: {
                text: {
                    text: text,
                }
            },
            position: {
                distance: .3,
            },
        }
    };

    const docassemble_cont: Ref<string> = ref('');

    const docassemble_cont_update = () => {
        if (typeof graph.value == "undefined")
            return;
        
        docassemble_cont.value = (new Transformer()).in_antv(graph.value).out_docassemble();
        // docassemble_cont.value = JSON.stringify((new Transformer()).in_antv(graph.value).out_json());
    };
    
    const remote_load = (remote_data: any) => {
        // graph.value?.fromJSON((new Transformer()).in_json(remote_data).out_antv());
    }

    const local_save = () => {
        if (typeof graph.value == "undefined")
            return;
        
        new Transformer().in_antv(graph.value).out_json()
    }

    const register_events = (graph: Graph) => {
        // events
        // https://x6.antv.vision/en/docs/tutorial/intermediate/events

        // if (typeof graph.value === "undefined")
        //     return false;

        graph.on('cell:change:*', docassemble_cont_update)
        graph.on('cell:removed', docassemble_cont_update)
        graph.on('cell:added', docassemble_cont_update)

        graph.on('cell:selected', ({ cell, options }) => {
            if (selected_cell.value != cell)
                selected_cell.value = cell
        })

        graph.on('cell:unselected', ({ cell, options }) => {
            if (selected_cell.value != null)
                selected_cell.value = undefined
        })

        graph.on('blank:click', ({ e, x, y }) => {
            if (selected_cell.value != null)
                selected_cell.value = undefined
        })
    }

    const init_modeler = () => {

        let container = document.getElementById('modeler-container')!;
        let width = container.scrollWidth;
        let height = container.scrollHeight || 500;

        graph.value = new Graph({
            ...graph_options_defaults,

            container: container,
            width,
            height,
        })

        if(graph.value != undefined)
        {
            graph_register_defaults(graph.value)
            register_events(graph.value)
            // window.graph_main = this.graph;
        }

    };

</script>
