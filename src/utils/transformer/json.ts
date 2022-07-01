import { pick } from "@/utils/data/pick";
import Graph, { Edge, Node } from "@/utils/graph";

// export type JSONGraphData = Partial<Graph> & Pick<Graph, 'name' | 'nodes' | 'edges'>
// export type JSONGraphData = Partial<Graph> & Pick<Graph, 'name'> & {
export type JSONGraphData = {
    'main': {
        'name': string
    },
    'nodes': Array<Partial<Node> & Pick<Node, 'id' | 'appearance' | 'gd'>>,
    'edges': Array<Partial<Edge> & Pick<Edge, 'id' | 'node_from_id' | 'node_to_id' | 'gd'>>,
}

export class JSONTransformer {
    
    in_json(graph: Graph, data: JSONGraphData) {
        graph.clear();

        graph.name = data.main.name;
        for (const node of data.nodes) {
            graph.add_node(node)
        }
        for (const edge of data.edges) {
            graph.add_edge(edge)
        }
        
        return graph;
    }

    out_json(graph: Graph) {
        
        const data = {
            'nodes': graph.nodes.map(node => pick(node, 'id', 'appearance', 'gd')),
            'edges': graph.edges.map(edge => pick(edge, 'id', 'node_from_id', 'node_to_id', 'gd')),
            'main': {
                'name': graph.name
            }
        }

        return data;
    }

}