import { Graph as AntvGraph } from "@antv/x6";
import { default as Graph, } from "../graph";
import { DocassembleTransformer } from "./docassemble";
import { AntvisTransformer } from "./antvis";
import { JSONTransformer } from "./json";

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
    in?(graph: Graph, ...params: any): Graph
    out?(graph: Graph, ...params: any): any
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

    in_json(data: Graph) {
        this.graph = this.json.in_json(this.graph, data);

        return this;
    }

    out_json() {
        return this.json.out_json(this.graph);
    }

    in_antv(ant_graph: AntvGraph) {
        this.graph = this.antvis.in_antv(this.graph, ant_graph)

        return this;
    }

    out_antv() {
        return this.antvis.out_antv(this.graph)
    }

    out_docassemble() {
        return this.docassemble.out(this.graph)
    }
}