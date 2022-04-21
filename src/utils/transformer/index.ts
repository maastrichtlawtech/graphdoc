import { Cell, Graph } from "@antv/x6";
import { Base as ShapeBase } from "@antv/x6/lib/shape/base";
import { default_edge_label, node_types, node_type_default } from "../graph";

export type Node = {
    id: number | string,
    type: keyof node_types,
    content: string,
    appearance: {
        x: number, y: number,
        width: number, height: number,
    },
    options: {[key: string]: any},

}

export type Edge = {
    id: number | string,
    node_from_id: number | string,
    node_to_id: number | string,
    content: string | null,
}

export type graphData = {
    nodes: Node[],
    edges: Edge[],

    graph: {
        // id: number,
        name: string;
    }
};

function indent(lines: string[], indent = 1, spaces_per = 2): string[] {
    return lines.map(line => ' '.repeat(indent*2).concat(line))
}

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

    get_nodes_by_type(type: keyof node_types) {
        return this.data?.nodes.filter(x => x.type == type);
    }

    node_get_nodes_in(node_id: string | number) {
        const node_ids = this.data?.edges
            .filter(edge => edge.node_to_id == node_id)
            .map(edge => edge.node_from_id) ?? [];
        return this.data?.nodes.filter(node => node_ids.includes(node.id));
    }

    node_get_nodes_out(node_id: string | number) {
        const node_ids = this.data?.edges
            .filter(edge => edge.node_from_id == node_id)
            .map(edge => edge.node_to_id) ?? [];
        return this.data?.nodes.filter(node => node_ids.includes(node.id));
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
            // console.log("loc_edge", loc_edge);

            let edge_content = loc_edge.getLabelAt(0)?.attrs?.text?.text?.toString() ?? null;
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

    da_node_get_id(node: Node): string {
        return `${ node.type }_${ node.id.toString().split('-')[0] }`
    }

    /**
     * Construct logic in code block for docassemble
     * @param node The root node to start traversal from
     * @param indent To indent this code relative to indent of current node
     * @returns string[] lines of code
     */
    da_build_logic(node: Node, indent_i = 0): string[] {
        // const node_children = this.node_get_nodes_out(node.id)!
        // console.log("da_build_logic", node.content, indent)

        const node_edges_out: Array<Edge & {node_to: Node}>  = this.data?.edges
            .filter(edge => edge.node_from_id == node.id)

            // flatMap: https://stackoverflow.com/a/59726888/17864167
            // add member: https://stackoverflow.com/a/44407980/17864167
            .flatMap(edge => {
                const node_to = this.data?.nodes.find(n => n.id == edge.node_to_id) ?? null;
                return node_to ? [{...edge, node_to }] : []
            }) ?? []
        
        let code: string[] = [];

        switch(node.type) {
            case 'start': {

                code.push(`def get_outcome_${ this.da_node_get_id(node) }():`)
                
                const sub_cont: string[] = []
                for(const node_edge_out of node_edges_out)
                    sub_cont.push(...this.da_build_logic(node_edge_out.node_to, 1))
                
                if (sub_cont.length > 0)
                    code.push(...indent(sub_cont))
                else
                    code.push(...indent(['pass']));
                
                code.push(`outcome = get_outcome_${ this.da_node_get_id(node) }()`)

                break

            }
            case 'end':
                code.push(`return ${ this.da_node_get_id(node) }`);

                break
            case 'decision': {

                for(const node_edge_out of node_edges_out) {                    
                    const sub_node = this.da_build_logic(node_edge_out.node_to, 1)

                    code.push(`if ${ this.da_node_get_id(node) } == '${ node_edge_out.content }':`);
                    code.push(...indent(sub_node || ['pass'], 1))
                }
                
                break
            }
            case 'notice': {
                code.push(`${ this.da_node_get_id(node) }`);

                for(const node_edge_out of node_edges_out) 
                    code.push(...this.da_build_logic(node_edge_out.node_to, 0));

                
                break
            }
        }

        return code
    }

    out_docassemble(): string {
        if (typeof this.data === "undefined")
            return 'contains errors';
            // throw Error("Transformer contains no data to encode")

        const node_start = this.get_nodes_by_type('start')![0]!;
        if (typeof node_start === "undefined")
            return 'no start node'
        //     throw Error("Graph is missing start node")
        const nodes_end = this.get_nodes_by_type('end');
        if (nodes_end?.length === 0)
            return 'no end node(s)'
        //     throw Error("Graph is missing atleast one end node")

        const blocks: Array<string[] | string> = [];
        
        blocks.push([
            'question: Start',
            `subquestion: ${ node_start.content }`,
        ]);

        let next_nodes = this.node_get_nodes_out(node_start.id) ?? []

        // const traverse = (node: graphData['nodes'][number]) => {
        //     for (const next_node of this.node_get_nodes_out(node.id)!) {
        //         traverse(next_node)
        //         return next_node
        //     }
        // }

        
        for (const node of this.data.nodes) {

            switch(node.type) {
                case 'start':
                    break
                case 'end':
                    break
                case 'decision': {
                    
                    const edges_out = this.data?.edges
                        .filter(edge => edge.node_from_id == node.id);
                    
                    let buttons: Array<string> = [];

                    for (const edge_out of edges_out) {
                        if (edge_out.content != null)
                            buttons.push(`  - "${ edge_out.content }"`)
                    }

                    if (buttons.length > 0)
                        buttons = ['buttons:', ...buttons]

                    blocks.push([
                        'question: Question',
                        `subquestion: ${ node.content }`,
                        `field: ${ this.da_node_get_id(node) }`,
                        ...buttons
                    ]);
                    break
                }
                case 'notice': {
                    blocks.push([
                        'question: Notice',
                        `subquestion: ${ node.content }`,
                        `continue button field: ${ this.da_node_get_id(node) }`,
                    ]);
                    break
                }
            }
        }
        
        const logic_code: string[] = [];
        for (const node_end of nodes_end ?? [])
            // adding declarations to end node
            logic_code.push(...indent([`${this.da_node_get_id(node_end)} = '${node_end.content}'`]))

        logic_code.push(...indent(this.da_build_logic(node_start)));

        if (logic_code.length > 0)
            blocks.push(['code: |', ...logic_code])
        
        // for(const )

        blocks.push([
            'mandatory: True',
            'question: End',
            'subquestion: ${outcome}'
        ]);
        
        let content = blocks.map((block) => {
            if (typeof block == "string")
                return block;
            else if(Array.isArray(block))
                return block.join("\n");
        }).join("\n---\n")

        // content = 
        
        return content;
    }

}