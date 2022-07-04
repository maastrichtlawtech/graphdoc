<template>

    <div v-if="cell == null">
        <span class="block p-2 text-gray-700">Select a node or edge to configure</span>
    </div>

    <div v-else-if="cell.isNode()" class="w-full p-3">

        <ModalComponent :modal="modal_field_content" v-if="modal_field_content.is_open" :container_style="{'max-width': '48rem'}">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Edit content</h3>
                    <div class="mt-2">
                        <p class="text-sm text-gray-500">
                            You can use <a href="https://commonmark.org/help/" target="_blank">markdown</a> to add styles to the content displayed for this node. 
                            Text containing HTML code will be rendered as HTML.
                            <span 
                                class="ml-1 text-sm text-gray-800 cursor-pointer select-none hover:text-gray-700 hover:underline"
                                @click="modal_field_content.data.read_more = !modal_field_content.data.read_more">
                                {{ modal_field_content.data.read_more ? 'less' : 'more' }}
                            </span>
                        </p>
                        
                        <template v-if="modal_field_content.data.read_more">
                            <p class="text-sm text-gray-500 mt-1">
                                Docassmble uses Mako as a templating system, to allow for including variables and code in content. More on how to use this at <a href="https://docassemble.org/docs/markup.html#mako" target="_blank">Docassemble</a>.
                            </p>
                            <p class="text-sm text-gray-500 mt-1">
                                Note that when referencing a variable, even in an 'if' statement, the block corresponding to the variable will be first shown to the user (regardless of the order specified in the graph).
                                To show a variable only when it is defined, one can use the <span class="code text-gray-700">defined('variable')</span> function within Mako, as described at <a href="https://docassemble.org/docs/markup.html#mako" target="_blank">Docassemble</a>.
                            </p>
                        </template>
                    </div>
                    <div class="mt-4">
                        <EasymdeView
                            :options="{}"
                            :value="modal_field_content.data.editor"
                            @input="e => modal_field_content.data.editor = e"
                            ></EasymdeView>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button @click="modal_field_content_accept(modal_field_content)" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">Accept</button>
                <button @click="modal_field_content.close()" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
            </div>       
        </ModalComponent>

        <div class="">
            <!-- <span class="m-2 font-bold block text-xl border-b border-gray-300">{{ titleCase((cell.data as AntvNodeData).gd.type) }} node</span> -->
            <span class="mb-2 text-ellipsis overflow-hidden font-mono block text-xl border-b border-gray-300">{{
                (cell.getData() as AntvNodeData).gd.variable ?? 
                    `${ (cell.getData() as AntvNodeData).gd.type }_${cell.id.toString().substring(0, 8)}`
                }}</span>
            
            <div class="w-full">
                <button @click="cell?.remove()" class="btn btn-red">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div v-for="(fields, field_group) in current_fields" :key="field_group">
                <div class="my-2">
                    <!-- <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">{{ field_group }}</span> -->
                    <span class="mt-1 mb-3 block border-b border-gray-300 text-lg leading-6 font-medium text-gray-800">{{ field_group.toString()[0].toUpperCase().concat(field_group.toString().substring(1)) }}</span>

                    <div v-for="field in fields" :key="field" class="block mt-2 mb-1 ">
                    
                        <label v-if="field == 'variable'">
                            <span class="text-gray-700 block mb-1 text-sm">Variable</span>
                            <div>
                                <!-- <input class="w-full" type="text" :placeholder="cell.id" v-model="node_variable" /> -->
                                <input class="style-soft w-full font-mono" type="text" v-model="node_variable" :placeholder="`${ (cell.getData() as AntvNodeData).gd.type }_${cell.id.toString().substring(0, 8)}`" />
                            </div>
                        </label>

                        <div v-if="field == 'label'">
                            <div class="flex justify-between items-center mb-1">
                                <label class="text-gray-700 block text-sm" for="textarea_content">Content</label>
                                <button
                                    class="btn text-sm" @click="modal_field_content.open()">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <textarea 
                                    id="textarea_content"
                                    style="min-height: 4rem;"
                                    class="w-full style-soft"
                                    type="text"
                                    v-model="node_content" 
                                />

                            </div>
                        </div>

                        <!-- 
                        <label v-else-if="field == 'annotation'">
                            <span class="text-gray-700 block mb-1">Annotation</span>
                            <!-.- <input class="w-full" type="text" v-model="cell.store.data.data.options.annotation" /> -.->
                            <textarea style="min-height: 3rem;" class="w-full" type="text" v-model="cell.store.data.data.options.annotation" />
                        </label>
                        -->
                        <!--
                        <span v-else>
                            <span class="text-gray-700 block mb-1">Undefined field: {{ field.charAt(0).toUpperCase() + field.slice(1) }}</span>
                        </span> -->
                    </div>
                </div>
            </div>

        </div>
        
    </div>

    <div v-else-if="cell.isEdge()" class="w-full p-2">
        <div class="">
            <span class="mb-2 font-bold block text-2xl border-b border-gray-300">Edge</span>

            <div>
                <button @click="cell?.remove()" class="btn btn-red">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div class="my-2" v-if="(cell.getSourceCell()?.getData() as AntvNodeData).gd.type == 'decision'">
                <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">General</span>

                <div class="block mt-2">
                    <label>
                        <span class="text-gray-700 block mb-1">Label</span>
                        <input
                            type="text"
                            class="style-soft w-full"
                            v-model="edge_content" />
                    </label>
                    <div class="w-full my-2 text-right">
                        <button class="inline btn mr-2" @click="edge_content = 'Yes'">Yes</button>
                        <button class="inline btn" @click="edge_content = 'No'">No</button>
                    </div>
                </div>

                <!-- <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">Appearance</span>
                <span class="text-gray-700 block mb-1">Nothing here yet</span> -->
            </div>

        </div>
    </div>

    <div v-else>
        <span>Invalid cell selected</span>
    </div>

</template>

<script lang="ts" setup>

    import { computed, ref } from 'vue';
    import { default_edge_label, node_types, node_type_default, AntvNodeData } from '@/utils/antv-model'

    import { Cell, Edge, Node } from '@antv/x6'

    import titleCase from '@/utils/data/titleCase';
    import { Modal } from '@/utils/modal';
    import ModalComponent from '@/components/shared/ModalComponent.vue';

    import EasymdeView from '@/components/shared/easymde'

    const props = defineProps<{
        cell: Cell | undefined
    }>();
    
    /* Modal definitions */
    // const modal_field_content_editor = ref('');
    const modal_field_content = new Modal({read_more: false, editor: ''}, {
        onOpen: () => {
            modal_field_content.data.editor = node_content.value;
        }
    });
    const modal_field_content_accept = (modal: typeof modal_field_content) => {
        node_content.value = modal.data.editor;
        modal.close();
    }

    /* Computing current fields */
    const current_fields = computed(() => {
        const field = props.cell?.getData()?.node_type ?? node_type_default;
        let current_node_fields = null;

        if (Object.keys(node_types).includes(field))
            current_node_fields = node_types[field as keyof node_types].config_fields;
        else
            current_node_fields = node_types[node_type_default].config_fields;

        // https://stackoverflow.com/a/62400741/17864167
        return Object.fromEntries(
            Object.entries(current_node_fields)
                .filter(([key, val]) => val.length > 0)
        )
    });

    /* Computed properties as 'middleman' for entered data and antvis model. */

    // The `utils/graph.ts` can't be used for storing data as it would require
    // updating antvis, based on graph.ts, on every (content) update.

    const node_content_ref = ref('');
    const node_content = computed({
        get() {
            // https://github.com/antvis/X6/issues/2020#issuecomment-1104644438
            // return (props.cell as Node).getAttrByPath('text/text') as string
            node_content_ref.value;
            return (props.cell as Node).getData().gd.content ?? '';
        },
        set(value: string) {
            // (props.cell as Node).setAttrByPath('text/text', value)
            node_content_ref.value = value;
            (props.cell as Node).setData({gd: {content: value}});
        }
    });

    const node_variable_ref = ref('');
    const node_variable = computed({
        get() {
            node_variable_ref.value;
            return ((props.cell as Node).getData() as AntvNodeData).gd.variable ?? '';
        },
        set(value: string) {
            node_variable_ref.value = value;
            (props.cell as Node).setData({gd: {variable: value != '' ? value : null}});
        }
    });

    // only reason for 'edge_content_ref' is for adding reactivity to edge_content,
    // relevant for pressing buttons
    const edge_content_ref = ref('');
    const edge_content = computed({
        get() {
            const edge = props.cell as Edge;
            edge_content_ref.value;
            return edge.getLabelAt(0)?.attrs?.text?.text?.toString() ?? '';
        },
        set(value: string) {
            const edge = props.cell as Edge;

            const edge_label = default_edge_label(value);
            if (edge_label != null) {
                edge.removeLabelAt(0);
                edge.setLabelAt(0, edge_label);
            }

            edge_content_ref.value = value;
            edge.setData({value})
        }
    });

</script>

<style lang="scss" scoped>

input {
    @apply border border-gray-200;
}

// button.action-btn-remove {
//     @apply font-normal bg-red-100 hover:bg-red-200 border border-red-200;
//     @apply hover:border-red-400  text-red-900 px-3 py-0.5 rounded;
// }

.modal-container {
    p a {
        @apply text-blue-600 hover:text-blue-500
    }
}

</style>