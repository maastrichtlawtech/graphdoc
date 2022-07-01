import { ITransformer } from ".";
import Graph, { Edge, Node } from "../graph";
import { indent } from "@/utils/data/indent"

export type validationErrorPart = string | Node | Edge;
export type validationErrorList = Array<validationErrorPart>[];

export class DocassembleTransformer implements ITransformer  {

    validate_graph(graph: Graph): validationErrorList {
        const errors: validationErrorList = [];

        // General graph errors
        const node_start = graph.get_nodes_by_type('start');
        if (node_start.length !== 1)
            errors.push([`graph must have exactly one start node (has ${node_start.length})`]);
        const nodes_end = graph.get_nodes_by_type('end');
        if (nodes_end.length === 0)
            errors.push([`graph must have atleast one end node`])

        // General input/output amount errors, and uniqueness of ID's.
        const variable_list: {[variable: string]: {amount: number, nodes: Node[]}} = {};
        for (const node of graph.nodes) {

            // Add variables to list in this phase, to save iterations
            const node_var = this.da_node_get_variable(node);
            if (node_var in variable_list) {
                variable_list[node_var].amount += 1;
                variable_list[node_var].nodes.push(node);
            } else {
                variable_list[node_var] = {amount: 1, nodes: [node]};
            }
            
            // Interpreting of edge amount errors
            if (node.gd.type == 'start' && node.get_edges_out().length !== 1)
                errors.push(['start node ', node, ` must have 1 outgoing edge (has ${node.get_edges_out().length})`])

            // else if (node.type == 'decision' && node.get_edges_out().length === 1)
            //     errors.push(`decision node with label ${node.content} has one outgoing edge, which makes it purpose trivial`) // warning
            else if (node.gd.type == 'decision' && node.get_edges_in().length === 0)
                errors.push(['decision node ', node, ' must have atleast one ingoing edge'])
            else if (node.gd.type == 'decision' && node.get_edges_out().length === 0)
                errors.push(['decision node ', node, ' must have atleast one outgoing edge'])

            else if (node.gd.type == 'notice' && node.get_edges_in().length === 0)
                errors.push(['notice node ', node, ' must have atleast one ingoing edge'])
            else if (node.gd.type == 'notice' && node.get_edges_out().length !== 1)
                errors.push(['notice node ', node, ' must have one outgoing edge'])

            else if (node.gd.type == 'end' && node.get_edges_in().length === 0){
                errors.push(['end node ', node, ' must have atleast one ingoing edge'])
            }
        }

        // Checking variable names: duplicate and invalid names
        for (const [variable, {amount, nodes}] of Object.entries(variable_list)) {

            const seperated_error_nodes: (string | Node)[] = [];
            nodes.forEach((node, i) => {
                seperated_error_nodes.push(node);
                if (i < (nodes.length - 1))
                   seperated_error_nodes.push(', ');
            })

            if (!variable.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/))
                errors.push([
                    `invalid (python) variable name '${variable}' on the node(s): `,
                    ...seperated_error_nodes
                ])

            if (amount > 1) {
                errors.push([
                    `variable name '${variable}' occurs is defined more than once, in the nodes: `,
                    ...seperated_error_nodes
                ]);
            }
        }

        // Decision-node specific errors
        const nodes_decision = graph.get_nodes_by_type('decision');
        for(const node_decision of nodes_decision) {
            let has_edge_out_content_null = false;

            const content_edges_out: {[content: string]: number} = {};
            const node_edges_out = node_decision.get_edges_out();

            for (const edge_out of node_edges_out) {
                if (edge_out.gd.content == null)
                    has_edge_out_content_null = true;
                
                // if length == 1, to ensure it's only printed once
                // if (content_edges_out.filter(x => x == edge_out.content).length == 1)
                //     errors.push(`decision node with label '${node_decision.content}' has multiple edges with content '${ edge_out.content }' (should be unique)`)
                
                if (edge_out.gd.content != null){
                    // https://stackoverflow.com/a/39591024
                    content_edges_out[edge_out.gd.content] = (content_edges_out[edge_out.gd.content]+1) || 1 ;
                }
            }
            
            if (has_edge_out_content_null)
                errors.push(['decision node ', node_decision, ' has atleast one outgoing edge with no content']);
            
            Object.entries(content_edges_out).forEach(([content, amount]) => {
                
                if (amount > 1) {
                    const edges = node_edges_out.filter(edge => edge.gd.content = content);
                    const error_start: validationErrorPart[] = [
                        `the decision node `, 
                        node_decision, 
                        ` has multiple edges with content '${ edges[0].gd.content }' on the edges: `,
                    ];
                    edges.forEach((tmp_edge, i) => {
                        error_start.push(tmp_edge)
                        if (i < (edges.length - 1))
                            error_start.push(', ')
                    })

                    errors.push(error_start)
                }
            });
        }

        // only perform cycle check if no other errors are present
        if (errors.length === 0) {
            
            // Cycle detection algorithm: https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm

            const L = [];
            const S = graph.nodes.filter(x => x.get_edges_in().length === 0);

            let edges = [...graph.edges]

            while (S.length > 0) {
                const n = S.pop()!;
                L.push(n);

                for (const e of edges.filter(x => x.node_from_id == n.id)) {
                    const m = e.get_node_to();

                    edges = edges.filter(x => !(x.id==e.id)) // remove e from edges
                    if (edges.filter(x => x.node_to_id == m.id).length === 0)
                        S.push(m)
                }
            }

            if (edges.length > 0) {
                errors.push(['graph must not contain cycles/loops'])
            }
        }

        return errors;
    }
    
    da_node_get_variable(node: Node): string {
        // return `${ node.type }_${ node.variable }`
        // return node.gd.variable ?? `${ node.gd.type }_${node.id.toString().substring(0, 8)}`;
        return node.get_variable();
    }
    
    da_node_escaped_markdown(node: Node): string {
        if (!node.gd.content)
            return `'[content of node ${ node.id.substring(0, 8) }]'`;

        const lines = node.gd.content.split(/\r?\n/);
        const escaped = [];
        for (const line of lines) {
            escaped.push(`${line}`);
        }
        return "|\n".concat(indent(escaped).join("\n"));
    }
    
    /**
     * Construct python code block for docassemble, from given graph and node
     * Performs recursive preorder depth-first search
     * @param node The root node to start traversal from
     * @param indent To indent this code relative to indent of current node
     * @returns string[] lines of code
     */
    da_build_logic(graph: Graph, node: Node): string[] {

        const node_edges_out = node.get_edges_out();
        
        const code: string[] = [];

        switch(node.gd.type) {
            case 'start': {
                code.push(...[ this.da_node_get_variable(node) ])

                for(const node_edge_out of node_edges_out) 
                    code.push(...this.da_build_logic(graph, node_edge_out.get_node_to()));

                break
            }
            case 'end':
                code.push(`${ this.da_node_get_variable(node) }`);

                break
            case 'decision': {

                for(const node_edge_out of node_edges_out) {            
                    const node_edge_out_content = node_edge_out.gd.content;
                    if (node_edge_out_content == null)
                        continue

                    const sub_node = this.da_build_logic(graph, node_edge_out.get_node_to())

                    code.push(`if ${ this.da_node_get_variable(node) } == '${ node_edge_out.gd.content }':`);
                    code.push(...indent(sub_node || ['pass'], 1))
                }
                
                break
            }
            case 'notice': {
                code.push(`${ this.da_node_get_variable(node) }`);

                for(const node_edge_out of node_edges_out) 
                    code.push(...this.da_build_logic(graph, node_edge_out.get_node_to()));
                
                break
            }
        }

        return code
    }

    /**
     * Generate the docassemble interview configuration content
     * @param graph Graph object satisfying the contract in utils/graph.ts
     *              and has been verified according to the validate_graph() 
     * @returns string docassemble interview code
     */
    out(graph: Graph): string {

        const node_start = graph.get_nodes_by_type('start')[0];
        const nodes_end = graph.get_nodes_by_type('end');

        const blocks: Array<string[] | string> = [];
        
        for (const node of graph.nodes) {

            switch(node.gd.type) {
                case 'start':
                    blocks.push([
                        'question: Start',
                        `subquestion: ${ this.da_node_escaped_markdown(node) }`,
                        `continue button field: ${ this.da_node_get_variable(node) }`,
                    ]);

                    break
                case 'end':
                    blocks.push([
                        `event: ${ this.da_node_get_variable(node) }`,
                        'question: End',
                        `subquestion: ${ this.da_node_escaped_markdown(node) }`,
                    ]);

                    break
                case 'decision': {
                    
                    const edges_out = graph.edges
                        .filter(edge => edge.node_from_id == node.id);
                    
                    let buttons: Array<string> = [];

                    for (const edge_out of edges_out) {
                        if (edge_out.gd.content != null)
                            buttons.push(`  - "${ edge_out.gd.content }"`)
                    }

                    // TODO: add option for priority of buttons (instead of sort)
                    buttons.sort()

                    if (buttons.length > 0)
                        buttons = ['buttons:', ...buttons]

                    blocks.push([
                        'question: Question',
                        `subquestion: ${ this.da_node_escaped_markdown(node) }`,
                        `field: ${ this.da_node_get_variable(node) }`,
                        ...buttons
                    ]);

                    break
                }
                case 'notice': {
                    blocks.push([
                        'question: Notice',
                        `subquestion: ${ this.da_node_escaped_markdown(node) }`,
                        `continue button field: ${ this.da_node_get_variable(node) }`,
                    ]);

                    break
                }
            }
        }
        
        const logic_code: string[] = [];
        logic_code.push(...indent(this.da_build_logic(graph, node_start)));

        if (logic_code.length > 0) {
            blocks.push([
                'mandatory: True',
                'code: |', ...logic_code
            ])
        }
        
        let content = blocks.map((block) => {
            if (typeof block == "string")
                return block;
            else if(Array.isArray(block))
                return block.join("\n");
        }).join("\n---\n")
        
        return content;
    }
}