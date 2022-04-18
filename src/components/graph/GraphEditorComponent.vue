<template>

    <div class="mb-8 mt-4 mx-auto max-w-6xl">

        <!--
        <div class="tab-buttons">
            <span class="tab-item active">Modeler</span>
            <span class="tab-item">Information</span>
        </div> -->

        <div>
            <div>
                <!-- 
                <GraphModeler v-if="remote_graph_data != null"
                    :root_graph_id="root_graph_id"
                    :remote_graph_data_reload="remote_graph_data_reload"
                    :remote_graph_data="remote_graph_data">
                </GraphModeler> -->

                <GraphModeler />

            </div>
        </div>

    </div>

</template>

<script lang="ts" setup>

    // import G6 from '@antv/g6';
    // import x6 from '@antv/x6';
    import { Graph } from '@antv/x6'
    import { onMounted } from 'vue'

    import GraphModeler from './GraphModeler.vue'

    onMounted(() => {
        console.log('Editor window mounted.')
        // this.remote_graph_data_reload();
    });

    // const root_graph_id = parseInt(route().params.graph, 10),
    // remote_graph_data: null,

    // const remote_graph_data_reload = () => {
    //     axios.get(route('graph.get', [this.root_graph_id])).then((resp) => {
    //         this.remote_graph_data = resp.data;
    //     });
    // }

</script>