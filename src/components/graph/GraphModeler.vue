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

    // import { default_node_ports, node_types } from '@/utils/model'
    
    import Transformer from '@/utils/transformer'

    const toast = useToast();

    // const props = defineProps<{
    //     remote_graph_data: Object,
    //     remote_graph_data_reload: Function,
    //     root_graph_id: Number,
    // }>()

    onMounted(() => {
        init_modeler()

        // watch(props.remote_graph_data, (value, old_value) => remote_load(value))
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
                distance: .25,
            },
        }
    };


    const docassemble_cont: Ref<string> = ref('');

    const docassemble_cont_update = () => {
        if (typeof graph.value == "undefined")
            return;
        
        console.log("docassemble conv called")
        docassemble_cont.value = new Transformer().in_antv(graph.value).out_docassemble()
    };
    
    const remote_load = (remote_data: any) => {
        graph.value?.fromJSON(new Transformer().in_json(remote_data).out_antv());
    }

    const local_save = () => {
        if (typeof graph.value == "undefined")
            return;
        
        new Transformer().in_antv(graph.value).out_json()
    }

    const register_events = () => {
        // events
        // https://x6.antv.vision/en/docs/tutorial/intermediate/events

        if (typeof graph.value === "undefined")
            return false;

        graph.value.on('cell:change:*', docassemble_cont_update)
        graph.value.on('cell:removed', docassemble_cont_update)
        graph.value.on('cell:added', docassemble_cont_update)

        graph.value.on('cell:selected', ({ cell, options }) => {
            // console.log(cell)
            if (selected_cell.value != cell)
            {
                selected_cell.value = cell
            }
        })

        graph.value.on('cell:unselected', ({ cell, options }) => {
            if (selected_cell.value != null)
                selected_cell.value = undefined
        })

        graph.value.on('blank:click', ({ e, x, y }) => {
            if (selected_cell.value != null)
                selected_cell.value = undefined
        })

        // https://x6.antv.vision/en/docs/api/registry/edge-tool
        graph.value.on('edge:mouseenter', ({ cell }) => {
            // console.log(cell)
            cell.addTools(
                [
                    {
                        name: 'button-remove',
                        args: {
                            distance: 20,
                            fill: '#00ff00'
                        },
                    },
                    'segments'
                ],
                'onhover',
            )
        })

        graph.value.on('edge:mouseleave', ({ cell }) => {
            // cell.removeTools('onhover')
            cell.removeTool('onhover')
        })
    }

    const init_modeler = () => {

        let container = document.getElementById('modeler-container')!;
        let width = container.scrollWidth;
        let height = container.scrollHeight || 500;

        graph.value = new Graph({
            container: container,
            grid: true,
            width,
            height,
            mousewheel: {
                enabled: true,
                modifiers: ['ctrl', 'meta'],
            },
            scroller: {
                enabled: true,
                pannable: true,
            },
            history: {
                enabled: true,
                beforeAddCommand(event: any, args: any) {
                    // console.log(event, args);
                    // prevent adding/removing tools on hover to be added to history
                    if (args.key == 'tools')
                    {
                        return false
                    }
                },
            },
            resizing: {
                enabled: true,
            },
            selecting: {
                enabled: true,
                // showNodeSelectionBox: true,
            },

            connecting: {
                // anchor: 'center',
                // connectionPoint: 'anchor',

                // https://x6.antv.vision/en/docs/tutorial/intermediate/interacting/#%E8%BF%9E%E7%BA%BF%E8%A7%84%E5%88%99
                allowBlank: false,
                allowMulti: false,
                allowLoop: false,
                allowNode: true,
                allowEdge: false,
                allowPort: false,

                highlight: true,
                snap: true,

                validateEdge(e) {
                    const edge = e.edge;
                    if (edge != null)
                    {
                        console.log("edge data", e.edge)

                        // const source_node_id = e.edge.getData().source?.cell ?? null;
                        // if (source_node_id != null)
                        //     e.edge.setSource({cell: source_node_id}) // move from output port to node itself, for 'easier' saving

                        // e.edge.addTools();
                    }

                    return true;
                },
            },

        })

        register_events()
        // window.graph_main = this.graph;

    };

</script>
