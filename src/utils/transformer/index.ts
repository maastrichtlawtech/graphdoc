import { Graph as AntvGraph } from "@antv/x6";
import { default as Graph, } from "../graph";
import { DocassembleTransformer } from "./docassemble";
import { AntvisTransformer } from "./antvis";
import { JSONGraphData, JSONTransformer } from "./json";

/*
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
        name: string;
    }
};
*/

// export type labledNode = Cell & { label: string, getLabel(): string }

export interface ITransformer {
    in?: (graph: Graph, ...params: Array<any>) => Graph
    out: (graph: Graph, ...params: Array<any>) => any
}

export default class {

    graph: Graph;
    json: JSONTransformer;
    antvis: AntvisTransformer;
    docassemble: DocassembleTransformer;

    
    constructor(graph?: Graph) {
        this.graph = graph ?? new Graph();

        this.json = new JSONTransformer()
        this.antvis = new AntvisTransformer()
        this.docassemble = new DocassembleTransformer()
    }

    // json

    in_json(data: JSONGraphData) {
        this.graph = this.json.in_json(this.graph, data);

        return this;
    }

    out_json() {
        return this.json.out_json(this.graph);
    }

    // antv

    in_antv(antv_graph: AntvGraph) {
        this.graph = this.antvis.in(this.graph, antv_graph)

        return this;
    }

    out_antv() {
        return this.antvis.out(this.graph)
    }

    // docassemble

    out_docassemble() {
        return this.docassemble.out(this.graph)
    }
}