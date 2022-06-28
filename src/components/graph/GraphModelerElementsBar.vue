<template>

    <div class="shape-holder">
        <!--         
        <div class="shape" data-type="start" @mousedown="startDrag($event)">
            Start
        </div>
        <div class="shape" data-type="decision" @mousedown="startDrag($event)">
            Decision
        </div>
        <div class="shape" data-type="notice" @mousedown="startDrag($event)">
            Notice
        </div>
        <div class="shape" data-type="end" @mousedown="startDrag($event)">
            End
        </div> 
        -->

        <div v-for="(node_type, node_type_name) of node_types" 
            :key="node_type_name"
            :class="`node node-${node_type_name}`"
            :data-type="node_type_name"
            @mousedown="startDrag($event)">
            {{ node_type_name }}
            
        </div>
    </div>

</template>

<script lang="ts" setup>
    // https://github.com/antvis/X6/blob/master/sites/x6-sites-demos/packages/tutorial/basic/dnd/dnd/src/app.tsx

    import { Addon, Graph } from '@antv/x6';
    import { Dnd } from '@antv/x6/lib/addon/dnd';
    
    import { onMounted, Ref, ref, watch } from 'vue';
    import { node_types } from '@/utils/antv-model';

    const props = defineProps<{
        graph: Graph | undefined,
        // node_type_defaults: Object
    }>()

    const dnd: Ref<Dnd | undefined> = ref();

    onMounted(() => {
        // https://github.com/antvis/X6/blob/master/sites/x6-sites-demos/packages/tutorial/basic/dnd/dnd/src/app.tsx
        // https://x6.antv.vision/en/docs/tutorial/basic/dnd

        // console.log(dnd.value);
    })

    watch(() => props.graph, (value: typeof props.graph) => {
        if (typeof value !== "undefined")
            init_dnd(value)

        // console.log("node-create", Node.create(node_types["notice"]))
    })

    const init_dnd = (graph: Graph) => {
        dnd.value = new Addon.Dnd({
            target: graph,
            scaled: false,
            animation: true,
            validateNode(droppingNode) {
                droppingNode.updateData({'is_stencil_node': undefined});
                return true;
            },
            
        })
    }
    
    const startDrag = (e: MouseEvent) => {
        if (typeof props.graph == "undefined")
            return false;

        /*
        const types = {
            'rect': {
                width: 100,
                height: 40,
                attrs: {
                    label: {
                        text: 'Rect',
                        fill: '#6a6c8a',
                    },
                    body: {
                        stroke: '#31d0c6',
                        strokeWidth: 2,
                    },
                },
            },
            'circle': {
                width: 100,
                height: 40,
                shape: 'html',
                html: () => {
                    const wrap = document.createElement('div')
                    wrap.style.width = '100%'
                    wrap.style.height = '100%'
                    wrap.style.display = 'flex'
                    wrap.style.alignItems = 'center'
                    wrap.style.justifyContent = 'center'
                    wrap.style.border = '2px solid rgb(49, 208, 198)'
                    wrap.style.background = '#fff'
                    wrap.style.borderRadius = '100%'
                    wrap.innerText = 'Circle'
                    return wrap
                },
            }
        };
        */

        const target = e.currentTarget
        const type = (target as HTMLElement).getAttribute('data-type')!

        if (!(type in node_types)) {
            return false
        }

        const node = props.graph.createNode(node_types[type as keyof node_types].antv_metadata);

        // node.label = type
        // node.setData({label: type})
        
        // (node as any).setLabel(type)
        // node.setAttrByPath('text/text', type)
        node.setData({label: type, is_stencil_node: true})
        
        dnd.value?.start(node, e)

    }
</script>

<style lang="scss">

    .shape-holder {

        user-select: none;
        margin-top: 2rem;

        .shape {
            @apply mb-1 p-2 bg-gray-200 border-gray-300 border-b-2 border-t;
        }

        .node {
            // @apply cursor-move text-gray-800 mx-1 mb-2 py-1.5 w-0;
            @apply cursor-move text-gray-600 mb-2  ;

            width: initial; 
            padding: 0.375rem 0.5rem;

            border-radius: 0;
            border-left: 0;
            border-right: 0;

            &:hover {
                @apply text-gray-900;
            }
        }

    }

</style>
