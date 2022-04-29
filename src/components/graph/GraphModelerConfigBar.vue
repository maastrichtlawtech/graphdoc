<template>

    <!-- <span>{{ cell }}</span> -->

    <div v-if="cell == null">
        <span class="block p-2">Select a node or edge to configure</span>
    </div>

    <div v-else-if="cell.isNode()" class="w-full">
    
        <div class="">
            <span class="m-2 font-bold block text-2xl border-b border-gray-300">Node: {{ (cell as any).store.data.data.node_type }}</span>

            <div v-for="(fields, field_group) in current_fields" :key="field_group">
                <div class="p-2">
                    <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">{{ field_group }}</span>

                    <div v-for="field in fields" :key="field" class="block mt-2 mb-1 ">
                        <label v-if="field == 'label'">
                            <span class="text-gray-700 block mb-1">Label</span>
                            <!-- <input class="w-full" type="text" v-model="cell.label" /> -->
                            <div>
                                <textarea 
                                    style="min-height: 3rem;"
                                    class="w-full"
                                    type="text"
                                    v-model="node_label" 
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
                        <label v-else-if="field == 'subgraph'">
                            <span class="text-gray-700 block mb-1">Subgraph</span>
                            <select class="w-full" v-model="cell.store.data.data.options.graph_id">
                                <option :value="undefined">None</option>
                                <option v-for="subgraph_option in subgraph_options" :value="subgraph_option.id">
                                    {{ subgraph_option.id }}) {{ subgraph_option.name }}
                                </option>
                            </select>
                        </label>
                        -->

                        <span v-else>
                            <span class="text-gray-700 block mb-1">Undefined field: {{ field.charAt(0).toUpperCase() + field.slice(1) }}</span>
                        </span>
                    </div>
                </div>
            </div>

        </div>
        
    </div>

    <div v-else-if="cell.isEdge()" class="w-full">
        <div class="">
            <span class="m-2 font-bold block text-2xl border-b border-gray-300">Edge</span>

            <div class="p-2">
                <span class="my-2 block border-b border-gray-300 uppercase font-bold text-sm text-gray-800">General</span>

                <div class="block mt-2 mb-1 ">
                    <label>
                        <span class="text-gray-700 block mb-1">Label</span>
                        <input
                            type="text"
                            class="w-full"
                            :value="edge_get_label(cell)" 
                            @input="event => edge_set_label((event.target as HTMLInputElement).value)" />
                    </label>
                </div>

            </div>

        </div>
    </div>

    <div v-else>
        <span>Invalid cell selected</span>
    </div>

</template>

<script lang="ts" setup>

    import { computed, onMounted, ref } from 'vue';
    import { default_edge_label, node_types, node_type_default } from '@/utils/model'

    import { Cell, Edge, Node } from '@antv/x6'

    // const props = defineProps({
    //     cell: {
    //         type: Cell,
    //         required: false
    //     }
    // });

    const props = defineProps<{
        cell: Cell | undefined
    }>();

    onMounted(() => {
        // axios.get(route('dashboard.graph.index.json')).then((resp) => {
        //     this.subgraph_options = resp.data.graphs;
        // });
    })

    // const null_value = null;
    // const subgraph_options = ref(null);
    
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

    const node_label = computed({
        get() {
            // https://github.com/antvis/X6/issues/2020#issuecomment-1104644438
            // return (props.cell as Node).getAttrByPath('text/text') as string

            return (props.cell as Node).getData().label ?? '';
        },
        set(value: string) {
            // (props.cell as Node).setAttrByPath('text/text', value)

            (props.cell as Node).setData({label: value});
        }
    });

    /*
    const node_get_label = () => {
        // return this.cell.store?.data?.labels?.[0] ?? '';
        // return (props.cell as any).getLabel();

        // https://github.com/antvis/X6/issues/2020#issuecomment-1104644438
        return (props.cell as Node).getAttrByPath('text/text')
    };
    
    const node_set_label = (content: string) => {
        // (props.cell as any).setLabel(content);

        (props.cell as Node).setAttrByPath('text/text', content)
    }
    */

    const edge_get_label = () => {
        // return this.cell.store?.data?.labels?.[0] ?? '';
        
        // console.log(props.cell);
        return (props.cell as Edge).getLabelAt(0)?.attrs?.text?.text ?? '';
        // return props.cell?.getData()?.labels?.[0].attrs.text.text ?? '';
        
        // return (props.cell as any).getLabels()[0] ?? ''
    };
    
    const edge_set_label = (content?: string) => {
        // (props.cell as any).setLabels(content)

        const edge_label = default_edge_label(content);
        if (edge_label != null) {
            (props.cell as Edge).removeLabelAt(0);
            (props.cell as Edge).setLabelAt(0, edge_label);
        }

        (props.cell as Edge).setData({content})

        // console.log("CELL DATA", props.cell)
    }

</script>

<style lang="scss">

input {
    @apply border border-gray-200;
}

</style>