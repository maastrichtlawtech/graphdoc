<template>

    <div class="toolbar ">
        <!--
        <div class="toolbar-item">
            <button @click="item_save()"><i class="las la-cloud-upload-alt"></i>Save</button>
        </div>
        -->
        <div class="toolbar-item">
            <button :disabled="typeof graph === 'undefined'" @click="item_undo()">Undo</button>
        </div>
        <div class="toolbar-item">
            <button :disabled="typeof graph === 'undefined'" @click="item_redo()">Redo</button>
        </div>
        
        <div class="toolbar-item">
            <button :disabled="typeof graph === 'undefined'" @click="item_clear()">Clear</button>
        </div>
        
        <!-- <div class="toolbar-item">
            <button :disabled="typeof graph === 'undefined'" @click="item_regenerate_docassemble()">Regenerate output</button>
        </div> -->
        
        <div class="toolbar-item">
            <button class="bg-blue-200" :disabled="typeof graph === 'undefined'" @click="item_import_custom_json()">Import JSON</button>
        </div>
        
        <div class="toolbar-item">
            <button class="bg-blue-200" :disabled="typeof graph === 'undefined'" @click="item_load_example()">Load default example</button>
        </div>
    </div>

</template>

<script lang="ts" setup>
    // https://github.com/antvis/X6/blob/master/sites/x6-sites-demos/packages/tutorial/basic/dnd/dnd/src/app.tsx

    import { Dom, Addon, Graph } from '@antv/x6';
    import Transformer from '@/utils/transformer'
    import { JSONGraphData } from '@/utils/transformer/json';
    import { useToast } from 'vue-toastification';

    const toast = useToast();

    const { Dnd } = Addon;

    const props = defineProps({
        graph: {
            type: Graph,
        },
        docassemble_cont_update: {
            type: Function,
        },
        init_modeler: {
            type: Function,
        }
    })

    const item_regenerate_docassemble = () => {
        props.docassemble_cont_update!()
    }
    

    const item_load_example = () => {
        // props.docassemble_cont_update!()
        if (confirm("Are you sure you want to load the example flowchart?")) {
            const json: JSONGraphData = {"nodes":[{"id":"9ed5d853-62a0-4395-afb9-d94e8cffd2cd","appearance":{"x":270,"y":40,"width":180,"height":36},"gd":{"type":"start","content":"walk or bus?","variable":"walk_or_bus"}},{"id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","appearance":{"x":270,"y":110,"width":180,"height":36},"gd":{"type":"decision","content":"is it raining?","variable":"is_raining"}},{"id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","appearance":{"x":90,"y":190,"width":180,"height":36},"gd":{"type":"notice","content":"take an umbrella","variable":"notice_take_umbrella"}},{"id":"d9a60522-cc80-40bf-b691-5e51b27b0e6c","appearance":{"x":90,"y":260,"width":180,"height":36},"gd":{"type":"end","content":"take the bus","variable":"end_bus"}},{"id":"20e3d21e-0799-4de7-8d1e-6cac260279ad","appearance":{"x":470,"y":260,"width":180,"height":36},"gd":{"type":"end","content":"take a walk","variable":"end_walk"}}],"edges":[{"id":"5106836e-d49c-4d33-9ed4-c6b5048ee11f","node_from_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","node_to_id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","gd":{"content":"Yes"}},{"id":"b81563a8-ad65-4d7e-86df-efbb0cf7fad4","node_from_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","node_to_id":"20e3d21e-0799-4de7-8d1e-6cac260279ad","gd":{"content":"No"}},{"id":"3008df09-bacb-4a33-9b3e-8e248e858c2b","node_from_id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","node_to_id":"d9a60522-cc80-40bf-b691-5e51b27b0e6c","gd":{"content":null}},{"id":"90c865d8-fbc3-4b7b-b0a3-46a8f1468c3e","node_from_id":"9ed5d853-62a0-4395-afb9-d94e8cffd2cd","node_to_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","gd":{"content":null}}],"name":"Untitled graph"};
            const antv = (new Transformer()).in_json(json).out_antv();
            props.graph?.fromJSON(antv);
            props.docassemble_cont_update!();
        }
    }

    const item_import_custom_json = () => {
        // props.docassemble_cont_update!()
        const custom_json = prompt("Enter the JSON you wish to import")
        if (custom_json) {
            const custom_json_parsed = JSON.parse(custom_json);
            if (custom_json_parsed) {
                const antv = (new Transformer()).in_json(custom_json_parsed).out_antv();
                props.graph?.fromJSON(antv);
                props.docassemble_cont_update!();
            } else {
                toast.error("Failed to parse import")
            }
        }
    }
    
    const item_use = () => {
        // window.open(route('graph.show', [this.remote_graph_data.graph.id]), '_blank');
    }
    
    const item_reload = () => {
        // props.remote_graph_data_reload()
    }

    const item_save = () => {
        // props.local_save()
    }
    
    const item_undo = () => {
        props.graph?.undo();
    }
    
    const item_redo = () => {
        props.graph?.redo();
    }

    const item_clear = () => {
        // if (typeof props.init_modeler !== "undefined" && confirm("Are you sure you want to reset your workspace?")){
        //     props.init_modeler();
        // }

        if (confirm("Are you sure you want to reset your workspace?")) {
            props.graph?.removeCells(props.graph.getCells()); 
            // TODO: set view to original state
        }
    }

</script>

<style lang="scss">
    
    .toolbar {

        @apply flex p-2;

        .toolbar-item button {

            &[disabled] {
                @apply bg-gray-300 cursor-not-allowed;
            }

            @apply bg-white border border-gray-300 text-gray-800 px-3 py-1  mr-2 rounded-md flex items-center font-normal;

            i {
                @apply mr-2 text-lg leading-none;
            }

            &:hover {
                @apply ring-4 ring-gray-200 border-gray-400 cursor-pointer ;
            }
        }

    }

</style>
