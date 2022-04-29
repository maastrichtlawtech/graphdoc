<template>

    <div class="toolbar ">
        <!--         
        <div class="toolbar-item">
            <button @click="item_use()"><i class="las la-play-circle"></i>Use</button>
        </div>
        <div class="toolbar-item">
            <button @click="item_reload()"><i class="las la-sync"></i>Reload</button>
        </div>
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
        <!-- 
        <div class="toolbar-item">
            <button :disabled="typeof graph === 'undefined'" @click="item_regenerate_docassemble()">Regenerate</button>
        </div>
        -->
    </div>

</template>

<script lang="ts" setup>
    // https://github.com/antvis/X6/blob/master/sites/x6-sites-demos/packages/tutorial/basic/dnd/dnd/src/app.tsx

    import { Dom, Addon, Graph } from '@antv/x6';

    const { Dnd } = Addon;

    const props = defineProps({

        graph: {
            type: Graph,
            required: false,
        },
        docassemble_cont_update: {
            type: Function,
            required: false,
        }
        // remote_graph_data_reload: {
        //     type: Function,
        // },
        // remote_graph_data: {
        //     type: Object,
        // },
        // local_save: {
        //     type: Function,
        // },

    })

    const item_regenerate_docassemble = () => {
        props.docassemble_cont_update!()
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

</script>

<style lang="scss">
    
    .toolbar {

        @apply flex p-2;

        .toolbar-item button {

            &[disabled] {
                @apply bg-gray-300 cursor-not-allowed;
            }

            @apply bg-white border border-gray-300 text-gray-800 px-3 py-1  mr-2 rounded-md;

            @apply flex items-center;

            i {
                @apply mr-2 text-lg leading-none;
            }

            &:hover {
                @apply bg-gray-200 border-gray-400 cursor-pointer;
            }
        }

    }

</style>
