<template>

    <ModalComponent :modal="modal_import" v-if="modal_import.is_open" :container_style="{'max-width': '30rem'}">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path class="stroke-blue-900" stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Import</h3>
                <p class="mt-2 text-sm text-gray-500">Paste the data of the exported interview below.</p>
                <textarea
                    placeholder="Paste the contents of the interview here"
                    ref="el_modal_import_text"
                    v-model="modal_import.data.text"
                    class="mt-2 w-full px-4 py-3 text-xs bg-gray-50 break-all font-mono resize-none h-20 leading-5 border border-gray-200 hover:shadow rounded-md">
                </textarea>
                <span class="block mt-2 text-sm text-gray-500">or <label class="text-sm cursor-pointer text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-400 py-0.5 px-1 mx-0.5 rounded-md">
                    <span>upload a file</span>
                    <input type="file" class="hidden" @change="modal_import_file_changed" />
                </label> instead.</span>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="modal_import_import()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                Import</button>
            <button @click="modal_import.close()" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel</button>
        </div>    
    </ModalComponent>

    <div class="toolbar">

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
            <button class="bg-blue-200" :disabled="typeof graph === 'undefined'" @click="modal_import.open()">Import</button>
        </div>
        
        <div class="toolbar-item">
            <button class="bg-blue-200" :disabled="typeof graph === 'undefined'" @click="item_load_example()">Load default example</button>
        </div>
    </div>

</template>

<script lang="ts" setup>
    // https://github.com/antvis/X6/blob/master/sites/x6-sites-demos/packages/tutorial/basic/dnd/dnd/src/app.tsx

    import { nextTick, Ref, ref } from 'vue';
    import { Addon, Graph } from '@antv/x6';
    import Transformer from '@/utils/transformer'
    import { JSONGraphData } from '@/utils/transformer/json';
    import { useToast } from 'vue-toastification';
    
    import ModalComponent from '@/components/shared/ModalComponent.vue'
    import { Modal } from '@/utils/modal';

    const toast = useToast();

    /* Modal definitions */
    const el_modal_import_text: Ref<HTMLElement | null> = ref(null);
    const modal_import: Modal<{text: string}> = new Modal({text: ''}, { 
        onOpen: () => {
            nextTick(() => {
                el_modal_import_text.value?.focus()
            })
        },
        onClose: () => modal_import.data.text = ""
    });
    const modal_import_file_changed = (event: Event) => {
        var reader = new FileReader();
        reader.onload = (ev) => {
            if ((ev.target?.result ?? false) && typeof ev.target?.result === 'string')
                modal_import.data.text = ev.target?.result;
        };
        const event_target = event.target as HTMLInputElement;
        if (event_target.files != null) {
            reader.readAsText(event_target.files[0]);
        }
    }
    const modal_import_import = () => {
        let import_cont = modal_import.data.text;

        if (import_cont.length == 0) {
            toast.error("No import data is empty")
            return;
        }

        // Step 1: find JSON by boundary.
        // Step 2: if boundary not exists, assume whole is JSON.
        // Boundary requirements:
        // Format: [START INLINE GRAPHDOC EXPORT]...{CONTENT}...[END INLINE GRAPHDOC EXPORT]
        //  - The dots represent any 5 characters before encountering the accolades (for matching next to comments).
        //  - Regex: /\[START INLINE GRAPHDOC EXPORT\].{0,5}(\{.*\}).{0,5}?\[END INLINE GRAPHDOC EXPORT\]/s

        const boundary_result = import_cont.match(/\[START INLINE GRAPHDOC EXPORT\].{0,5}(\{.*\}).{0,5}?\[END INLINE GRAPHDOC EXPORT\]/s);
        if (boundary_result && boundary_result[1]) {
            import_cont = boundary_result[1];
        }

        let import_json: object = {};
        try {
            import_json = JSON.parse(import_cont);
            if (!import_json)
                throw Error(); // to trigger same exception
        } catch (e) {
            toast.error("Data does not contain valid JSON, or does not contain the GraphDoc boundary specifier.")
            // modal_import.data.error = "Data does not contain valid JSON, or does not contain the GraphDoc boundary specifier."
            return;
        }

        if (!Object.hasOwnProperty.call(import_json, "main") || 
            !Object.hasOwnProperty.call(import_json, "nodes") || 
            !Object.hasOwnProperty.call(import_json, "edges")) {
            toast.error("Data does not include one of the required properties: 'main', 'nodes' or 'edges'.");
            // modal_import.data.error = "Data does not include one of the required properties: 'main', 'nodes' or 'edges'."
            return;
        }
        
        const antv = (new Transformer()).in_json(import_json as JSONGraphData).out_antv();

        props.graph?.fromJSON(antv);
        props.docassemble_cont_update!();

        toast.success("Imported")
        modal_import.close();
    }

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
            const json: JSONGraphData = {"nodes":[{"id":"9ed5d853-62a0-4395-afb9-d94e8cffd2cd","appearance":{"x":270,"y":40,"width":180,"height":36},"gd":{"type":"start","content":"walk or bus?","variable":"walk_or_bus"}},{"id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","appearance":{"x":270,"y":110,"width":180,"height":36},"gd":{"type":"decision","content":"is it raining?","variable":"is_raining"}},{"id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","appearance":{"x":90,"y":190,"width":180,"height":36},"gd":{"type":"notice","content":"take an umbrella","variable":"notice_take_umbrella"}},{"id":"d9a60522-cc80-40bf-b691-5e51b27b0e6c","appearance":{"x":90,"y":260,"width":180,"height":36},"gd":{"type":"end","content":"take the bus","variable":"end_bus"}},{"id":"20e3d21e-0799-4de7-8d1e-6cac260279ad","appearance":{"x":470,"y":260,"width":180,"height":36},"gd":{"type":"end","content":"take a walk","variable":"end_walk"}}],"edges":[{"id":"5106836e-d49c-4d33-9ed4-c6b5048ee11f","node_from_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","node_to_id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","gd":{"content":"Yes"}},{"id":"b81563a8-ad65-4d7e-86df-efbb0cf7fad4","node_from_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","node_to_id":"20e3d21e-0799-4de7-8d1e-6cac260279ad","gd":{"content":"No"}},{"id":"3008df09-bacb-4a33-9b3e-8e248e858c2b","node_from_id":"396a3b5e-a0cd-49c4-96c3-c65a8da0c483","node_to_id":"d9a60522-cc80-40bf-b691-5e51b27b0e6c","gd":{"content":null}},{"id":"90c865d8-fbc3-4b7b-b0a3-46a8f1468c3e","node_from_id":"9ed5d853-62a0-4395-afb9-d94e8cffd2cd","node_to_id":"b8bdd58d-ab1f-44d0-82b8-5edb21f3d484","gd":{"content":null}}],"main":{"name":"Untitled graph"}};
            const antv = (new Transformer()).in_json(json).out_antv();
            props.graph?.fromJSON(antv);
            props.docassemble_cont_update!();
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
