
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

    const node_edges_out: Array<Edge & {node_to: Node}>  = this.graph.edges
        .filter(edge => edge.node_from_id == node.id)

        // flatMap: https://stackoverflow.com/a/59726888/17864167
        // add member: https://stackoverflow.com/a/44407980/17864167
        .flatMap(edge => {
            const node_to = this.graph.nodes.find(n => n.id == edge.node_to_id) ?? null;
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
    // if (typeof this.data === "undefined")
    //     return 'contains errors';
        // throw Error("Transformer contains no data to encode")

    const node_start = this.graph.get_nodes_by_type('start')[0];
    if (typeof node_start === "undefined")
        return 'no start node'
    //     throw Error("Graph is missing start node")
    const nodes_end = this.graph.get_nodes_by_type('end');
    if (nodes_end?.length === 0)
        return 'no end node(s)'
    //     throw Error("Graph is missing atleast one end node")

    const blocks: Array<string[] | string> = [];
    
    blocks.push([
        'question: Start',
        `subquestion: ${ node_start.content }`,
    ]);
    
    for (const node of this.graph.nodes) {

        switch(node.type) {
            case 'start':
                break
            case 'end':
                break
            case 'decision': {
                
                const edges_out = this.graph.edges
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
        // adding declarations to end nodes content
        logic_code.push(...indent([`${this.da_node_get_id(node_end)} = '${node_end.content}'`]))

    logic_code.push(...indent(this.da_build_logic(node_start)));

    if (logic_code.length > 0)
        blocks.push(['code: |', ...logic_code])

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
    
    return content;
}
