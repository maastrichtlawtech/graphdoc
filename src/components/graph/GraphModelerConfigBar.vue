<template>

    <!-- <span>{{ cell }}</span> -->

    <div v-if="cell == null">
        <span class="block p-2 text-gray-700">Select a node or edge to configure</span>
    </div>

    <div v-else-if="cell.isNode()" class="w-full">
    
        <div class="">
            <span class="m-2 font-bold block text-2xl border-b border-gray-300">{{ titleCase((cell.data as AntvNodeData).gd.type) }} node</span>
            
            <div class="p-2">
                <button @click="cell?.remove()" class="action-btn-remove">Remove</button>
            </div>

            <div v-for="(fields, field_group) in current_fields" :key="field_group">
                <div class="p-2">
                    <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">{{ field_group }}</span>

                    <div v-for="field in fields" :key="field" class="block mt-2 mb-1 ">
                    
                        <label v-if="field == 'variable'">
                            <span class="text-gray-700 block mb-1">Variable</span>
                            <div>
                                <!-- <input class="w-full" type="text" :placeholder="cell.id" v-model="node_variable" /> -->
                                <input class="w-full" type="text" v-model="node_variable" />
                            </div>
                        </label>

                        <label v-if="field == 'label'">
                            <span class="text-gray-700 block mb-1">Content</span>
                            <div>
                                <textarea 
                                    style="min-height: 3rem;"
                                    class="w-full"
                                    type="text"
                                    v-model="node_content" 
                                />
                            </div>
                        </label>

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

    <div v-else-if="cell.isEdge()" class="w-full">
        <div class="">
            <span class="m-2 font-bold block text-2xl border-b border-gray-300">Edge</span>

            <div class="p-2">
                <button @click="cell?.remove()" class="action-btn-remove">Remove</button>
            </div>

            <div class="p-2" v-if="(cell.getSourceCell()?.getData() as AntvNodeData).gd.type == 'decision'">
                <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">General</span>

                <div class="block mt-2">
                    <label>
                        <span class="text-gray-700 block mb-1">Label</span>
                        <input
                            type="text"
                            class="w-full"
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

    const props = defineProps<{
        cell: Cell | undefined
    }>();
    
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

    const node_content = computed({
        get() {
            // https://github.com/antvis/X6/issues/2020#issuecomment-1104644438
            // return (props.cell as Node).getAttrByPath('text/text') as string

            return (props.cell as Node).getData().gd.content ?? '';
        },
        set(value: string) {
            // (props.cell as Node).setAttrByPath('text/text', value)

            (props.cell as Node).setData({gd: {content: value}});
        }
    });

    const node_variable = computed({
        get() {
            return ((props.cell as Node).getData() as AntvNodeData).gd.variable ?? '';
        },
        set(value: string) {
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

<style lang="scss">

input {
    @apply border border-gray-200;
}

button.action-btn-remove {
    @apply font-normal bg-red-100 hover:bg-red-200 border border-red-200;
    @apply hover:border-red-400  text-red-900 px-3 py-0.5 rounded;
}

</style>