import { Graph as AntvGraph } from "@antv/x6";
import { default as Graph, } from "../graph";
import { DocassembleTransformer } from "./docassemble";
import { AntvisTransformer } from "./antvis";
import { JSONGraphData, JSONTransformer } from "./json";

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