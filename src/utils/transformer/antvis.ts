import Graph from "../graph";
import { Graph as AntvGraph } from "@antv/x6";
import { default_edge_attrs, default_edge_label, default_node_ports, node_types, node_type_default } from "../model";
import { ITransformer } from ".";
import { uuid } from "../data/uuid";

export class AntvisTransformer implements ITransformer {


    // inspired from: https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L442
    in(graph: Graph, antv_graph: AntvGraph): Graph {
        graph.clear();

        const local_data = {
            'nodes': antv_graph.getNodes(),
            'edges': antv_graph.getEdges(),
        };
        
        for(const loc_node of local_data.nodes) {
            
            const node_type = loc_node.getData()?.node_type ?? node_type_default;

            const rem_node = {
                // 'id': loc_node.store.data?.data?.node_id ?? 0,
                id: loc_node.id,
                
                // content: loc_node.attr<string>('text/text') ?? '[no data]',
                content: loc_node.getData().label ?? '[no data]',
                type: node_type,
                appearance: {
                    x: loc_node.getPosition().x ?? 0,
                    y: loc_node.getPosition().y ?? 0,
                    width: loc_node.getSize().width
                        ?? node_types[node_type as keyof node_types].antv_metadata.width,
                    height: loc_node.getSize().height 
                        ?? node_types[node_type as keyof node_types].antv_metadata.height,
                },
                options: {
                    // TODO: from all data.fields, to raw. TODO in deserialize: opposite
                    // ALTERNATIVELY (chosen): in deserialize don't load appearance?
                    // still filter on appearance to prevent collision
                    // ...Object.fromEntries(
                    //     Object.entries(loc_node.store?.data).filter(([key, value]) => key === 'appearance') )
                    // ...loc_node.store?.data?.data?.options ?? {}

                    // other method, same as in deserialization
                    ...Object.fromEntries(Object.entries(loc_node.getData()?.options ?? {}).filter(([key, value]) => {
                        return !['node_id', 'appearance'].includes(key);
                    }))
                },
            }
            
            graph.add_node(rem_node)
        }

        let alt_id_i = 1;
        for(const loc_edge of local_data['edges']) {
            // console.log("loc_edge", loc_edge);

            // both source and target ought to be known (non null)
            if (loc_edge.getSourceCell() == null || loc_edge.getTargetCell() == null)
                continue

            let edge_content = loc_edge.getLabelAt(0)?.attrs?.text?.text?.toString() ?? null;
            if (edge_content == "")
                edge_content = null;

            const rem_edge = {
                // id: loc_edge.getData()?.edge_id ?? alt_id_i++,
                id: loc_edge.id ?? uuid(),
                
                node_from_id: loc_edge.getSourceCellId(),
                node_to_id:   loc_edge.getTargetCellId(),
                // content: loc_edge.labels?.[0]?.attrs?.text?.text ?? null,
                content: edge_content,
                appearance: {
                    vertices: loc_edge.getVertices(),
                },
                options: {},
            }

            graph.add_edge(rem_edge)
        }

        return graph;
    }

    // inspired from: https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L525
    out(graph: Graph) {

        const data_nodes: Array<any> = [];
        let last_x = 0;
        
        Object.values(graph.nodes).forEach((node) => {

            let node_ser = {
                // default values (includes ports etc); can be overwritten after spread
                ...node_types[node.type].antv_metadata,

                // id: `node-${node.id}`,
                id: node.id,

                x: node.appearance?.x ?? (last_x += 50),
                y: node.appearance?.y ?? 50,

                // width: undefined as number | undefined,
                // height: undefined as number | undefined,

                // width: node.options?.appearance?.width ?? 100,
                // height: node.options?.appearance?.height ?? 100,

                // width: node.options?.appearance?.width ?? null,
                // height: node.options?.appearance?.height ?? null,

                // label: node.content,
                data: {
                    node_id: node.id,
                    node_type: node.type,
                    label: node.content,
                    // https://stackoverflow.com/a/62400741 , see reference in serialize fn.
                    // options: Object.fromEntries(Object.entries(node.options).filter(([key, value]) => {
                    //     return !['node_id', 'node_type', 'appearance'].includes(key);
                    // }))
                },
            }

            // https://stackoverflow.com/a/58245240
            node_ser = Object.assign(
                {},
                node_types[node.type].antv_metadata ?? node_types.notice.antv_metadata ?? {},
                node_ser,
            );

            // because there are defaults
            if (node_ser.width == null && node.appearance?.width != null)
                node_ser.width = node.appearance.width;
            if (node_ser.height == null && node.appearance?.height != null)
                node_ser.height = node.appearance.height;

            data_nodes.push(node_ser);
        })
        
        const data_edges: Array<any> = [];

        Object.values(graph.edges).forEach((edge) => {
            const edge_label = default_edge_label(edge.content);

            const edge_ser = {
                ...default_edge_attrs,

                // id: `edge-${edge.id}`,
                id: edge.id,

                labels: edge_label != null ? [ edge_label ] : [],

                // shape: 'edge',
                // https://x6.antv.vision/zh/docs/api/registry/router#orth
                // router: {
                //     name: 'orth',
                // },
                /*
                connector: {
                    name: 'jumpover',
                    args: {
                        type: 'arc',
                    },
                },
                */
                
                source: {
                    // cell: `node-${edge.node_from_id}`,
                    cell: edge.node_from_id,
                    port: 'out-1'
                },
                target: {
                    // cell: `node-${edge.node_to_id}`,
                    cell: edge.node_to_id,
                    port: 'in-1'
                },
                data: {
                    edge_id: edge.id,
                },

            }

            data_edges.push(edge_ser)
        })


        const data = {
            nodes: data_nodes,
            edges: data_edges,
        }

        // this.graph.fromJSON(data);

        return data;
    }
}