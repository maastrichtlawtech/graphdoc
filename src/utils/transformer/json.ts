import { pick } from "@/utils/data/pick";
import Graph, { Edge, Node } from "@/utils/graph";

// export type JSONGraphData = Partial<Graph> & Pick<Graph, 'name' | 'nodes' | 'edges'>
// export type JSONGraphData = Partial<Graph> & Pick<Graph, 'name'> & {
export type JSONGraphData = {
    'nodes': Array<Partial<Node> & Pick<Node, 'id' | 'content' | 'type' | 'appearance'>>,
    'edges': Array<Partial<Edge> & Pick<Edge, 'id' | 'node_from_id' | 'node_to_id' | 'content'>>,
    'name': string
}

export class JSONTransformer {
    
    in_json(graph: Graph, data: JSONGraphData) {
        graph.clear();

        graph.name = data.name;
        for (const node of data.nodes) {
            graph.add_node(node)
        }
        for (const edge of data.edges) {
            graph.add_edge(edge)
        }

        // console.log("in data", data)
        // console.log('graph', graph)
        return graph;
    }

    out_json(graph: Graph) {
        
        const data = {
            'nodes': graph.nodes.map(node => pick(node, 'id', 'type', 'content', 'appearance', 'options')),
            'edges': graph.edges.map(edge => pick(edge, 'id', 'content', 'node_from_id', 'node_to_id')),
            'name': graph.name
        }

        return data;
    }

}