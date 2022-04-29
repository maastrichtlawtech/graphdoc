<template>

    <div class="mb-4">
        <span>
            <h1 class="text-4xl font-serif inline">Welcome to graph-doc</h1> 
            <!-- <button @click="read_more = !read_more" class="shadow-sm border border-gray-300 ml-4 py-1 px-2 bg-gray-100 text-gray-700 hover:text-gray-900 hover:border-gray-400">read more</button> -->
            <button @click="read_more = !read_more" class="font-normal underline-offset-4 underline hover:no-underline pl-6 py-1 px-2  text-gray-600 hover:text-gray-900">read {{ read_more ? 'less' : 'more' }}</button>
        </span>
        <div v-if="read_more" class="text-sm">
            <p class="mt-2">
                This tool serves as a PoC to convert simple flowcharts to docassemble interviews. 
                The goal of this tool is to provide an intuitive interface for constructing docassemble interviews, 
                in which relations and dependencies between nodes ('blocks') are more clearly visible.
            </p>
            <h2 class="text-lg font-serif mt-2 mb-1">Usage</h2>
            <p>
                Start by dragging nodes from the left sidebar.
                Connect nodes by dragging edges from and to the ports of the nodes.
                Configure nodes and edges by clicking on their cells and filling in the details in the config sidebar on the right.
                If no output is produced, interpret the validation errors presented above the docassemble output window.
            </p>
        </div>
    </div>
    <div class="border border-gray-400 rounded overflow-hidden">
        <div class="w-full bg-gray-100">
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
    <div class="border border-gray-500 rounded mt-4 mb-2 py-2 px-3" :class="{ 'bg-red-50': docassemble_validation_errors.length > 0 }">
        <template v-if="docassemble_validation_errors.length > 0">
            <span class="block underline">Validation errors</span>
            <ul class="list-disc list-inside">
                <li class="text-red-900" v-for="validation_error in docassemble_validation_errors" :key="validation_error">
                    {{ validation_error }}
                </li>
            </ul>
        </template>
        <span v-else class="block text-green-800">Graph contains no errors</span>
    </div>
    <div class="my-4">
        <span>Docassemble out:</span>
        <div class="w-full min-h-4 font-mono border rounded p-2 mt-1 whitespace-pre-wrap">
            {{ docassemble_cont }}
        </div>
    </div>

</template>

<script lang="ts" setup>

    import { computed, onMounted, reactive, Ref, ref, watch } from 'vue';

    import { useToast } from "vue-toastification";

    import axios from 'axios';
    import { Cell, Graph } from '@antv/x6';

    import GraphModelerConfigBar from './GraphModelerConfigBar.vue'
    import GraphModelerElementsBar from './GraphModelerElementsBar.vue'
    import GraphModelerToolbar from './GraphModelerToolbar.vue'
    
    import Transformer from '@/utils/transformer'
    import { graph_options_defaults, graph_register_defaults } from '@/utils/model'
    import { DocassembleTransformer } from '@/utils/transformer/docassemble';

    const read_more = ref(false);

    const toast = useToast();

    onMounted(() => {
        init_modeler()
        docassemble_cont_update()
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

    const docassemble_validation_errors: Ref<string[]> = ref([]);
    const docassemble_cont: Ref<string> = ref('');

    const docassemble_cont_update = () => {
        if (typeof graph.value == "undefined")
            return;
        
        const transformer = (new Transformer()).in_antv(graph.value);

        docassemble_validation_errors.value = (new DocassembleTransformer()).validate_graph(transformer.graph);
        if(docassemble_validation_errors.value.length == 0)
            docassemble_cont.value = (new Transformer()).in_antv(graph.value).out_docassemble();
        else
            docassemble_cont.value = '-';
        
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
