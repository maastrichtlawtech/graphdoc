import { pick } from "@/utils/data/pick";
import Graph from "@/utils/graph";

export class JSONTransformer {
    
    in_json(graph: Graph, data: Graph) {
        // const data = JSON.parse(data_json)
        // this.data = data;
        graph.clear();

        graph.name = data.name;
        // TODO: rest importing

        return graph;
    }

    out_json(graph: Graph) {
        
        const data = {
            'nodes': graph.nodes.map(node => pick(node, 'id', 'type', 'content', 'appearance', 'options')),
            'edges': graph.edges.map(edge => pick(edge, 'id', 'content', 'node_from_id', 'node_to_id')),
            'graph': {
                'name': graph.name
            }
        }

        return data;
    }

}