import { Cell, Graph } from "@antv/x6";
import { Base as ShapeBase } from "@antv/x6/lib/shape/base";
import { default_edge_label, node_types, node_type_default } from "../graph";

export type graphData = {
    nodes: {
        id: number | string,
        type: keyof node_types,
        content: string,
        appearance: {
            x: number, y: number,
            width: number, height: number,
        },
        options: {[key: string]: any},

    }[],
    edges: {
        id: number | string,
        node_from_id: number | string,
        node_to_id: number | string,
        content: string | null,
    }[],

    graph: {
        // id: number,
        name: string;
    }
};

// export type labledNode = Cell & { label: string, getLabel(): string }

export default class {
    data: graphData | undefined;

    init_data(name = "Untitled graph") {
        this.data = {
            nodes: [],
            edges: [],
            graph: {
                // id: 1,
                name
            }
        }
    }

    in_json(data: graphData) {
        this.data = data;

        return this;
    }
    out_json() {
        if (typeof this.data === "undefined")
        {
            console.error("No data to encode")
            return {};
        }

        return this.data;
    }


    // inspired from: https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L442
    in_antv(graph: Graph) {
        this.init_data();

        // const local_data = this.graph.toJSON();
        const local_data = {
            'nodes': graph.getNodes(),
            'edges': graph.getEdges(),
        };

        console.log("local:", graph);

        for(const loc_node of local_data.nodes as ShapeBase[]) {
            // console.log("loc_node", loc_node);
            
            const node_type = loc_node.getData()?.node_type ?? node_type_default;

            const rem_node = {
                // 'id': loc_node.store.data?.data?.node_id ?? 0,
                id: loc_node.id,
                // content: (loc_node as ShapeBase).getLabel() ?? '',
                content: loc_node.getLabel() ?? '[no data]',
                type: node_type,
                appearance: {
                    
                    // x: loc_node.store.data?.position?.x ?? null,
                    // y: loc_node.store.data?.position?.y ?? null,
                    // width: loc_node.store.data?.size?.width ?? null,
                    // height: loc_node.store.data?.size?.height ?? null,

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

            this.data?.nodes.push(rem_node)
        }

        let alt_id_i = 1;
        for(const loc_edge of local_data['edges']) {
            console.log("loc_edge", loc_edge);

            let edge_content = loc_edge.getLabelAt(0)?.markup?.toString() ?? null;
            if (edge_content == "")
                edge_content = null;

            const rem_edge = {
                id: loc_edge.getData()?.edge_id ?? alt_id_i++,

                // 'node_from_id': parseInt(loc_edge.store.data?.source?.cell.split('-')[1],10) ?? null,
                    // 'node_to_id': parseInt(loc_edge.store.data?.target?.cell.split('-')[1],10) ?? null,

                // node_from_id: loc_edge.store.data?.source?.cell,
                // node_to_id:   loc_edge.store.data?.target?.cell,

                node_from_id: loc_edge.getSourceCellId(),
                node_to_id:   loc_edge.getTargetCellId(),
                // content: loc_edge.labels?.[0]?.attrs?.text?.text ?? null,
                content: edge_content,
                appearance: {
                    vertices: loc_edge.getVertices(),
                },
                options: {},
            }

            this.data?.edges.push(rem_edge)
        }

        // this.data = serialized;
        // console.log("serialized:", serialized);

        return this;
    }

    // inspired from: https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L525
    out_antv() {
        if (typeof this.data === "undefined")
        {
            console.error("Transformer contains no data to encode")
            return {};
        }

        const data_nodes: Array<any> = [];
        let last_x = 0;
        
        Object.values(this.data.nodes).forEach((node) => {

            let node_ser = {
                x: node.appearance?.x ?? (last_x += 50),
                y: node.appearance?.y ?? 50,

                width: undefined as number | undefined,
                height: undefined as number | undefined,

                // width: node.options?.appearance?.width ?? 100,
                // height: node.options?.appearance?.height ?? 100,

                // width: node.options?.appearance?.width ?? null,
                // height: node.options?.appearance?.height ?? null,

                id: `node-${node.id}`,
                label: node.content,
                data: {
                    node_id: node.id,
                    node_type: node.type,
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
            {
                node_ser.width = node.appearance.width;
            }

            if (node_ser.height == null && node.appearance?.height != null)
            {
                node_ser.height = node.appearance.height;
            }

            data_nodes.push(node_ser);
        })
        
        const data_edges: Array<any> = [];

        Object.values(this.data.edges).forEach((edge) => {
            const edge_label = default_edge_label(edge.content);

            const edge_ser = {
                id: `edge-${edge.id}`,

                labels: edge_label != null ? [ edge_label ] : [],

                shape: 'edge',
                // https://x6.antv.vision/zh/docs/api/registry/router#orth
                // router: {
                //     name: 'orth',
                // },
                connector: {
                    name: 'jumpover',
                    args: {
                        type: 'arc',
                    },
                },
                
                source: `node-${edge.node_from_id}`,
                target: `node-${edge.node_to_id}`,
                data: {
                    edge_id: edge.id,
                },
            }

            // let edge_label = default_edge_label();

            data_edges.push(edge_ser)
        })


        const data = {
            nodes: data_nodes,
            edges: data_edges,
        }

        // this.graph.fromJSON(data);

        return data;
    }

    out_docassemble2(): string {
        if (typeof this.data === "undefined")
        {
            console.error("Transformer contains no data to encode")
            return '';
        }

        const blocks: Array<string[] | string> = [];

        for (const node in this.data.nodes) {
            blocks.push(['hey']);
            console.log("node", node)
        }

        blocks.push([
            'mandatory: True',
            'event: outcome',
            'question: Uitkomst:',
            'subquestion: ${ outcome_str }',
            // 'buttons:',
            // '  Restart: restart',
            // 'under',
        ]);

        // console.log(this.data)
        const content = blocks.map((block) => {
            if (typeof block == "string")
                return block;
            else if(Array.isArray(block))
                return block.join("\n");
        }).join("\n---\n")

        console.log(content);

        return content;
    }

    out_docassemble(): string {
        if (typeof this.data === "undefined")
        {
            console.error("Transformer contains no data to encode")
            return '';
        }

        const blocks: Array<string[] | string> = [];

        for (const node in this.data.nodes) {
            blocks.push(['hey']);
            console.log("node", node)
        }

        blocks.push([
            'mandatory: True',
            'event: outcome',
            'question: Uitkomst:',
            'subquestion: ${ outcome_str }',
            // 'buttons:',
            // '  Restart: restart',
            // 'under',
        ]);

        // console.log(this.data)
        const content = blocks.map((block) => {
            if (typeof block == "string")
                return block;
            else if(Array.isArray(block))
                return block.join("\n");
        }).join("\n---\n")

        console.log(content);

        return content;
    }

}