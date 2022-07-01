// This file is basically 'graphdoc-model'

import { node_types } from "./antv-model";
import { Filter } from "@antv/x6/lib/registry";
import { uuid } from "./data/uuid";

export type Id = string;

export interface Node {
    graph: Graph
    id: Id,

    gd: {
        type: keyof node_types,
        variable?: string | null,
        content?: string | null,
    }
    // content: {[lang: string]: string}, // for multilang support
    
    // options: {[key: string]: any},
    appearance: {
        x: number, y: number,
        width: number, height: number,
    },
}

export const NodeDefault: Partial<Node> = {
    appearance: {
        x: 0, y: 0,
        width: 100, height: 100
    },
    gd: {
        type: 'notice', // notice is most generic
        content: null,
        variable: null
    },
}

export class Node {

    constructor(options: Partial<Node> & Pick<Node, 'graph'>) {
        if (typeof options.id == "undefined")
            options.id = uuid();
        // options.variable = `${options.id}`;

        Object.assign(this, NodeDefault, options);
    }

    // not sure if this is the best method of determining the type
    is_node() { return true; }
    is_edge() { return false; }

    get_label() {
        // return this.gd.variable ?? this.gd.content ?? this.id.substring(0, 8);
        return this.gd.variable ?? this.gd.content ?? `${ this.gd.type }_${this.id.toString().substring(0, 8)}`;
    }

    get_variable() {
        // return this.gd.variable ?? this.gd.content ?? this.id.substring(0, 8);
        return this.gd.variable ?? `${ this.gd.type }_${this.id.toString().substring(0, 8)}`;
    }
 
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
    
    gd: {
        content: string | null,
    }
}

export const EdgeDefault: Partial<Edge> = {
    gd: {
        content: null,
    }
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

    is_node() { return false; }
    is_edge() { return true; }

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
    name: string;
    nodes: Array<Node> = [];
    edges: Array<Edge> = [];

    constructor(name = 'Untitled graph') {
        this.name = name;
    }

    get_nodes_by_type(type: keyof node_types) {
        return this.nodes.filter(x => x.gd.type == type) ?? [];
    }

    // add_node(options: Partial<Node>) {
    add_node(options: Partial<Node> & Pick<Node, 'id' | 'appearance' | 'gd'>) {
        this.nodes.push(new Node({...options, graph: this}))
    }

    add_edge(options: Partial<Edge> & Pick<Edge, 'id' | 'node_from_id' | 'node_to_id' | 'gd'>) {
        this.edges.push(new Edge({...options, graph: this}))
    }
    
    clear() {
        this.nodes = [];
        this.edges = [];
    }
    
}

export default Graph