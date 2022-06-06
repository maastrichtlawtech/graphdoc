import { ITransformer } from ".";
import Graph, { Node } from "../graph";
import { indent } from "@/utils/data/indent"

export class DocassembleTransformer implements ITransformer  {

    validate_graph(graph: Graph): string[] {
        const errors = [];

        const node_start = graph.get_nodes_by_type('start');
        if (node_start.length !== 1)
            errors.push('graph must have exactly one start node')
        const nodes_end = graph.get_nodes_by_type('end');
        if (nodes_end?.length === 0)
            errors.push('graph must have atleast one end node')

        const nodes_decision = graph.get_nodes_by_type('decision');
        for(const node_decision of nodes_decision) {
            let has_edge_out_content_null = false;
            const content_edges_out = [];

            for (const edge_out of node_decision.get_edges_out()) {
                if (edge_out.content == null)
                    has_edge_out_content_null = true;
                
                // if length == 1, to ensure it's only printed once
                if (content_edges_out.filter(x => x == edge_out.content).length == 1)
                    errors.push(`decision node with label '${node_decision.content}' has multiple edges with content '${ edge_out.content }' (should be unique)`)
                
                if (edge_out.content != null)
                    content_edges_out.push(edge_out.content)
            }
            
            if (has_edge_out_content_null)
                errors.push(`decision node with label '${node_decision.content}' has atleast one outgoing edge with no content`)
        }

        for (const node of graph.nodes) {
            // if (node.type == 'start' && node.get_edges_in().length > 0)
            //     errors.push(`start node with label ${node.content} must have no ingoing edges`) // impossible (?)
            if (node.type == 'start' && node.get_edges_out().length !== 1)
                errors.push(`start node with label '${node.content}' must have one outgoing edge`)

            // else if (node.type == 'decision' && node.get_edges_out().length === 1)
            //     errors.push(`decision node with label ${node.content} has one outgoing edge, which makes it purpose trivial`) // recommendation
            else if (node.type == 'decision' && node.get_edges_in().length === 0)
                errors.push(`decision node with label '${node.content}' must have atleast one ingoing edge`)
            else if (node.type == 'decision' && node.get_edges_out().length === 0)
                errors.push(`decision node with label '${node.content}' must have atleast one outgoing edge`)

            else if (node.type == 'notice' && node.get_edges_in().length === 0)
                errors.push(`notice node with label '${node.content}' must have atleast one ingoing edge`)
            else if (node.type == 'notice' && node.get_edges_out().length !== 1)
                errors.push(`notice node with label '${node.content}' must have one outgoing edge`)

            else if (node.type == 'end' && node.get_edges_in().length === 0)
                errors.push(`end node with label '${node.content}' must have one ingoing edge`)
        }

        // only perform cycle check if no other errors are present
        if (errors.length === 0) {
            // Cycle detection algorithm: https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm

            const L = [];
            const S = graph.nodes.filter(x => x.get_edges_in().length === 0);

            let edges = [...graph.edges]
            console.log(edges);

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

            // console.log("TOPO SORT:", L);
            // console.log("EDGES:", edges);

            if (edges.length > 0) {
                errors.push("graph must not contain cycles/loops")
            }
        }

        return errors;
    }
    
    da_node_get_id(node: Node): string {
        return `${ node.type }_${ node.variable }`
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

        switch(node.type) {
            case 'start': {

                code.push(`def get_outcome_${ this.da_node_get_id(node) }():`)
                code.push(...indent([ this.da_node_get_id(node) ]))
                
                const sub_cont: string[] = []
                for(const node_edge_out of node_edges_out)
                    sub_cont.push(...this.da_build_logic(graph, node_edge_out.get_node_to()))
                
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
                    const node_edge_out_content = node_edge_out.content;
                    if (node_edge_out_content == null)
                        continue

                    const sub_node = this.da_build_logic(graph, node_edge_out.get_node_to())

                    code.push(`if ${ this.da_node_get_id(node) } == '${ node_edge_out.content }':`);
                    code.push(...indent(sub_node || ['pass'], 1))
                }
                
                break
            }
            case 'notice': {
                code.push(`${ this.da_node_get_id(node) }`);

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

            switch(node.type) {
                case 'start':
                    blocks.push([
                        'question: Start',
                        `subquestion: ${ node.content }`,
                        `continue button field: ${ this.da_node_get_id(node) }`,
                    ]);

                    break
                case 'end':
                    break
                case 'decision': {
                    
                    const edges_out = graph.edges
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

        logic_code.push(...indent(this.da_build_logic(graph, node_start)));

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
}