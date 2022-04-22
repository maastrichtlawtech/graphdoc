import { node_types } from "./model";
import { v4 as uuidv4 } from 'uuid';
import { Filter } from "@antv/x6/lib/registry";

export type Id = string;
function get_id() {
    return uuidv4()
}

export interface Node {
    graph: Graph
    id: Id,

    type: keyof node_types,
    content: string,
    options: {[key: string]: any},
    appearance: {
        x: number, y: number,
        width: number, height: number,
    },
}

export interface Edge {
    graph: Graph
    id: Id,
    node_from_id: Id,
    node_to_id: Id,
    
    content: string | null,
}

export abstract class Node {

    constructor(graph: Graph, id: Id | null = null, content = '<empty>') {
        this.graph = graph;
        this.id = id ?? get_id();

        this.content = content;
    }

    get_edges_in() {
        return this.graph.edges
            .filter(edge => edge.node_to_id == this.id)
    }

    get_nodes_in() {
        const node_ids = this.get_edges_in()
            .map(edge => edge.node_from_id) ?? []; // only return node_ids
        return this.graph.nodes
            .filter(node => node_ids.includes(node.id));
    }

    get_edges_out() {
        return this.graph.edges
            .filter(edge => edge.node_from_id == this.id)
    }

    get_nodes_out() {
        const node_ids = this.get_edges_out()
            .map(edge => edge.node_to_id) ?? [];
        return this.graph.nodes
            .filter(node => node_ids.includes(node.id));
    }

}

export abstract class Edge {

    constructor(graph: Graph, id: Id | null = null, node_from_id: Id, node_to_id: Id, content: string | null = null) {
        this.graph = graph;
        this.id = id ?? get_id();

        this.node_from_id = node_from_id;
        this.node_to_id = node_to_id;
        this.content = content;
    }

    node_from() {
        return this.graph.nodes
            .filter(node => node.id == this.node_from_id)
    }

    node_to() {
        return this.graph.nodes
            .filter(node => node.id == this.node_to_id)
    }

}

class Graph {
    name;
    nodes: Array<Node> = [];
    edges: Array<Edge> = [];

    constructor(name: string = 'Untitled graph') {
        this.name = name;
    }

    get_nodes_by_type(type: keyof node_types) {
        return this.nodes.filter(x => x.type == type);
    }
    
    clear() {
        this.nodes = [];
        this.edges = [];
    }
    
}

export default Graph