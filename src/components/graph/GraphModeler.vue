<template>

    <div class="mb-4">
        <span>
            <h1 class="text-4xl font-serif inline">GraphDoc</h1> 
            <!-- <button @click="read_more = !read_more" class="shadow-sm border border-gray-300 ml-4 py-1 px-2 bg-gray-100 text-gray-700 hover:text-gray-900 hover:border-gray-400">read more</button> -->
            <button @click="read_more = !read_more" class="font-normal underline-offset-4 underline hover:no-underline pl-6 py-1 px-2  text-gray-600 hover:text-gray-900">read {{ read_more ? 'less' : 'more' }}</button>
        </span>
        <div v-if="read_more" class="text-sm">
            <p class="mt-2">
                This tool serves as a PoC to convert flowcharts (which can be represented as directed acyclic graphs) to docassemble interviews. 
                The goal of this tool is to provide an intuitive interface for constructing docassemble interviews, 
                in which relations and dependencies between nodes ('blocks') are more clearly visible.
            </p>
            <h2 class="text-lg font-serif mt-2 mb-1">Instructions</h2>
            <p>
                Start by dragging nodes from the left sidebar.
                Connect nodes by dragging edges from and to the ports of the nodes.
                Configure nodes and edges by clicking on their cells and filling in the details in the config sidebar on the right. Nodes and edges can also be removed from this sidebar.
                If no output is produced, interpret the validation errors presented above the docassemble output window.
                For an example of a well structured graph, click on 'Load example'.
            </p>
        </div>
    </div>
    <div class="border border-gray-400 rounded overflow-hidden">
        <div class="w-full bg-gray-100">
            <GraphModelerToolbar
                :graph="graph" 
                :docassemble_cont_update="docassemble_cont_update"
                :init_modeler="init_modeler"
                 />
        </div>
        <div class="w-full flex" style="height: 500px;">
            <div class="w-20 flex-initial bg-gray-100 border-t  border-gray-200">
                <GraphModelerElementsBar v-if="graph !== null" :graph="graph"></GraphModelerElementsBar>
            </div>
            <div id="modeler-container-box" class="flex flex-grow border-4 border-b-0 border-gray-300" >
            <!-- <div id="modeler-container-box" class="flex  w-full h-full" > -->
                <!-- <div id="modeler-container" class="relative h-full"></div> -->
                <!-- <div id="modeler-container" class="relative h-full flex-grow border-4 border-b-0 border-gray-300" style="flex: 1"></div> -->
                <div id="modeler-container" style="flex: 1"></div>
            </div>
            <div class="w-64 flex-initial bg-gray-100 border-t border-gray-200 overflow-y-auto">
                <GraphModelerConfigBar :cell="selected_cell"></GraphModelerConfigBar>
            </div>
        </div>
    </div>
    
    <GraphValidationErrors :formatted_validation_errors="formatted_validation_errors" />
    
    <div class="my-4">
        <span class="text-lg block mb-1">Docassemble interview output</span>
        <label class="text-sm text-gray-700">
            <input type="checkbox" class="mr-1" v-model="docassemble_out_options.include_json_export" /> Include a copy of the model
        </label>
        <div class="relative">
            <div class="w-full min-h-4 font-mono border rounded p-2 mt-1 whitespace-pre-wrap" id="docassemble_out_container">
                {{ docassemble_cont }}
            </div>
            <span class="copy-button" @click="copy_docassemble_out()">{{ copy_button_content }}</span>
        </div>
    </div>

</template>

<script lang="ts" setup>

    import { computed, h, onMounted, reactive, Ref, ref, VNode, watch } from 'vue';

    import { useToast } from "vue-toastification";

    import axios from 'axios';
    import { Cell, Graph } from '@antv/x6';

    import GraphModelerConfigBar from './GraphModelerConfigBar.vue'
    import GraphModelerElementsBar from './GraphModelerElementsBar.vue'
    import GraphModelerToolbar from './GraphModelerToolbar.vue'
    import GraphValidationErrors from './GraphValidationErrors.vue'
    
    import Transformer from '@/utils/transformer'
    import { default_edge_label, graph_options_defaults, graph_register_defaults } from '@/utils/antv-model'
    import { DocassembleTransformer, validationErrorList } from '@/utils/transformer/docassemble';
    import { Node, Edge } from '@/utils/graph';

    const read_more = ref(false);

    const toast = useToast();

    onMounted(() => {
        init_modeler()
        docassemble_cont_update()
    })

    const graph_data: Ref<object> = ref({});
    const graph: Ref<Graph | undefined> = ref();

    const selected_cell: Ref<Cell | undefined> = ref();
    function select_cell(cell: Cell | undefined) {
        if (typeof cell !== 'undefined') {
            selected_cell.value = cell;
            graph.value?.select(cell);
            graph.value?.scrollToCell(cell);
        }
    }

    const docassemble_validation_errors: Ref<validationErrorList> = ref([]);
    const formatted_validation_errors: Ref<(string | VNode)[][]> = ref([]);
    const docassemble_cont: Ref<string> = ref('');

    const docassemble_out_options = reactive({
        include_json_export: true,
    });

    watch(() => docassemble_out_options, (val => {
        console.log("options updated")
        docassemble_cont_update();
    }), { deep: true })

    // type NotFunction<T> = T extends Node | Edge ? never : T;

    const docassemble_cont_update = () => {
        if (typeof graph.value == "undefined")
            return;
        
        const transformer = (new Transformer()).in_antv(graph.value);

        docassemble_validation_errors.value = (new DocassembleTransformer()).validate_graph(transformer.graph);

        // remove cells from all errors
        graph.value.getCells().forEach(cell => 
            typeof cell.getData()?.errors !== 'undefined' &&
            cell.setData({'errors': false}, {no_da_update: true}));
        
        // graph.value.getCells().forEach(cell => console.log(typeof cell.getData()?.errors, cell.getData()));

        // console.log(docassemble_validation_errors.value)

        // this part formats the conversion errors, which contain Node and Edge 
        // objects, to a clickable span as a VNode
        formatted_validation_errors.value = docassemble_validation_errors.value.map((val_error) => {
            return val_error.map(error_part => {
                if (typeof error_part === "string") {
                    return error_part;
                } else if (error_part.is_node()) {
                    const error_node = (error_part as Node);
                    const antv_node = graph.value?.getCellById(error_node.id);
                    if (typeof antv_node !== 'undefined') {
                        antv_node.setData({errors: true}, {no_da_update: true});
                        return h('span', {
                            onClick(event: any) {
                                select_cell(antv_node);
                            },
                            class: 'clickable-entity'
                        }, error_node.get_label());
                    } else {
                        return `"${ error_node.get_label() }""`
                    }
                } else if (error_part.is_edge()) {
                    const error_edge = (error_part as Edge);
                    const antv_edge = graph.value?.getCellById(error_edge.id);
                    const error_edge_content = error_edge.gd.content ? 
                        `with content ${error_edge.gd.content}` : 
                        `leaving from node ${ error_edge.get_node_from().get_label() }`;
                    if (typeof antv_edge !== 'undefined') {
                        return h('span', {
                            onClick(event: any) {
                                select_cell(graph.value?.getCellById(error_edge.gd.content ? error_edge.id : error_edge.node_from_id));
                            },
                            class: 'clickable-entity'
                        }, error_edge_content);
                    } else {
                        return `"${ error_edge_content }"`
                    }
                } else {
                    return ''
                }
            });
        });


        // console.log(formatted_validation_errors.value)

        // const transformer = new Transformer()).in_antv(graph.value);

        if(formatted_validation_errors.value.length == 0) {
            docassemble_cont.value = transformer.out_docassemble()
            if (docassemble_cont.value && docassemble_out_options.include_json_export) {
                docassemble_cont.value = docassemble_cont.value
                    .concat("\n---\n# [START INLINE GRAPHDOC EXPORT]")
                    .concat("\n# ").concat(JSON.stringify(transformer.out_json()))
                    .concat("\n# [END INLINE GRAPHDOC EXPORT]");
            }
        } else {
            docassemble_cont.value = '-';
        }
        
        // docassemble_cont.value = JSON.stringify((new Transformer()).in_antv(graph.value).out_json());
        // docassemble_cont.value = JSON.stringify(graph.value.toJSON());
    };

    const copy_button_content = ref('COPY');
    const copy_docassemble_out = () => {
        
        (window as any).getSelection().selectAllChildren(
            document.getElementById('docassemble_out_container')
        );


        // source: https://stackoverflow.com/a/67008779/17864167
        navigator.clipboard.writeText(docassemble_cont.value)
        .then(() => {
            copy_button_content.value = 'COPIED!';
            setTimeout(() => { copy_button_content.value = 'COPY' }, 1200)
        })
        .catch(err => {
            copy_button_content.value = 'FAILED';
            setTimeout(() => { copy_button_content.value = 'COPY' }, 1200)
            console.log('Failed to copy', err);
        });
    }
    
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
        
        // graph.on('cell:change:*', docassemble_cont_update)
        // graph.on('cell:change:*', ())

        graph.on('cell:change:*', (args) => {
            // console.log(args)
            if (!(args.options.no_da_update ?? false)) {
                if (args.key == 'target') {
                    // when target hits, it changes from {x: n, y: n} to Cell, which we will catch here.
                    if (typeof args.current.cell != typeof args.previous.cell)
                        docassemble_cont_update()

                // other changes to ignore:
                } else if (!['target', 'zIndex', 'tools', 'position'].includes(args.key as string))
                    docassemble_cont_update()
            }
        })

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
        // let container_box = document.getElementById('modeler-container-box')!;

        // // for resetting
        // // container.innerHTML = "";
        // // container_box.innerHTML = "";
        // // container_box.appendChild(container);

        let width = container.scrollWidth;
        let height = container.scrollHeight || 500;

        graph.value = new Graph({
            ...graph_options_defaults,

            container: container,
            autoResize: true,

            // width,
            // height,
        })

        // graph.value.resize()

        if(graph.value != undefined)
        {
            graph_register_defaults(graph.value);
            register_events(graph.value);

            docassemble_cont_update()
            // window.graph_main = this.graph;
        }

    };

</script>

<style lang="scss">
.validation-error {
    span.clickable-entity {
        @apply font-mono text-sm;

        color: rgb(63, 19, 19);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 4px;

        &:hover {
            // @apply text-black;
            text-decoration: initial;
        }
    }
}

.copy-button {
    @apply absolute top-0 right-0 m-2 px-2 py-0.5 rounded border bg-gray-100;
    @apply text-sm uppercase font-bold text-gray-600 ;
    &:hover {
        @apply ring-2 ring-gray-200 border-gray-300 cursor-pointer 
    }
}
</style>