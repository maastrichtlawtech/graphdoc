import { node_types } from "./model";
import { Filter } from "@antv/x6/lib/registry";
import { uuid } from "./data/uuid";

export type Id = string | number;

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

export const NodeDefault = {
    appearance: {
        x: 0, y: 0,
        width: 100, height: 100
    },
    options: {},
    content: '<empty>',
    type: 'notice'
}

export class Node {

    constructor(options: Partial<Node> & Pick<Node, 'graph'>) {
        options.id = options.id ?? uuid()

        Object.assign(this, NodeDefault, options);
    }

    /*
    constructor(graph: Graph, id: Id | null = null, content = '<empty>') {
        this.graph = graph;
        this.id = id ?? get_id();

        this.content = content;
    }
    */

    get_edges_in() {
        return this.graph.edges
            .filter(edge => edge.node_to_id == this.id)
    }

    get_edges_out() {
        return this.graph.edges
            .filter(edge => edge.node_from_id == this.id)
    }

    get_nodes_in() {
        const node_ids = this.get_edges_in()
            .map(edge => edge.node_from_id) ?? []; // only return node_ids
        return this.graph.nodes
            .filter(node => node_ids.includes(node.id));
    }

    get_nodes_out() {
        const node_ids = this.get_edges_out()
            .map(edge => edge.node_to_id) ?? [];
        return this.graph.nodes
            .filter(node => node_ids.includes(node.id));
    }

}


export interface Edge {
    graph: Graph
    id: Id,
    node_from_id: Id,
    node_to_id: Id,
    
    content: string | null,
}

export const EdgeDefault = {
    appearance: {
        x: 0, y: 0,
        width: 100, height: 100
    },
    options: {},
    content: '<empty>',
    type: 'notice'
}

export class Edge {

    constructor(options: Partial<Edge> & Pick<Edge, 'graph'>) {
        options.id = options.id ?? uuid()

        Object.assign(this, EdgeDefault, options);
    }

/*
    constructor(graph: Graph, id: Id | null = null, node_from_id: Id, node_to_id: Id, content: string | null = null) {
        this.graph = graph;
        this.id = id ?? get_id();

        this.node_from_id = node_from_id;
        this.node_to_id = node_to_id;
        this.content = content;
    }
*/
    get_node_from() {
        return this.graph.nodes
            .filter(node => node.id == this.node_from_id)[0]
    }

    get_node_to() {
        return this.graph.nodes
            .filter(node => node.id == this.node_to_id)[0]
    }

}

class Graph {
    name;
    nodes: Array<Node> = [];
    edges: Array<Edge> = [];

    constructor(name = 'Untitled graph') {
        this.name = name;
    }

    get_nodes_by_type(type: keyof node_types) {
        return this.nodes.filter(x => x.type == type) ?? [];
    }

    // add_node(options: Partial<Node>) {
    add_node(options: Partial<Node> & Pick<Node, 'id' | 'content' | 'type' | 'appearance'>) {
        this.nodes.push(new Node({...options, graph: this}))
    }

    add_edge(options: Partial<Edge> & Pick<Edge, 'id' | 'node_from_id' | 'node_to_id' | 'content'>) {
        this.edges.push(new Edge({...options, graph: this}))
    }

    // add_node(graph: Graph, content = '<empty>') {
    //     this.nodes.push(new Node({graph, id: get_id(), content}))
    // }
    
    clear() {
        this.nodes = [];
        this.edges = [];
    }
    
}

export default Graph