
import { Graph, Node, Path } from '@antv/x6';
import { Options } from '@antv/x6/lib/graph/options';

import '@antv/x6-vue-shape'

export const default_edge_label = (text: string | null = '') => {
    if (text == null)
        return null;

    return {
        attrs: {
            text: {
                text: text,
            }
        },
        position: {
            distance: .25,
        },
    }
}

export const graph_options_defaults: Partial<Options.Manual> = {
    grid: true,

    background: {
        color: 'white'
    },

    mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
    },

    scroller: {
        enabled: true,
        pannable: true,
    },

    connecting: {

        // https://x6.antv.vision/en/docs/tutorial/intermediate/interacting/#%E8%BF%9E%E7%BA%BF%E8%A7%84%E5%88%99
        allowBlank: false,
        allowMulti: false,
        allowLoop: false,
        allowEdge: false,

        allowNode: false,
        allowPort: true,

        highlight: true,
        snap: true,

        // https://x6.antv.vision/en/examples/showcase/practices#dag
        connector: 'algo-connector',
        connectionPoint: 'boundary',
        // anchor: 'center',

        validateMagnet({ magnet }) {
          return magnet.getAttribute('port-group') !== 'in'
        },
        // createEdge(this) {
        //     return this.createEdge({
        //         shape: 'dag-edge',
        //         attrs: {
        //             line: {
        //                 strokeDasharray: '5 5',
        //             },
        //         },
        //         zIndex: -1,
        //     })
        // },

        validateEdge(e) {
            const edge = e.edge;
            if (edge != null)
            {
                console.log("edge data", e.edge)
            }

            return true;
        },
    },

    history: {
        enabled: true,
        beforeAddCommand(event: any, args: any) {
            // console.log(event, args);
            // prevent adding/removing tools on hover to be added to history
            if (args.key == 'tools')
            {
                return false
            }
        },
    },
    resizing: {
        enabled: true,
    },
    selecting: {
        enabled: true,
        multiple: false,
        
    },

}

export function graph_register_defaults(graph: Graph) {
    // https://x6.antv.vision/en/docs/api/registry/edge-tool
    graph.on('edge:mouseenter', ({ cell }) => {
        // console.log(cell)
        cell.addTools(
            [
                {
                    name: 'button-remove',
                    args: {
                        distance: 20,
                        fill: '#00ff00'
                    },
                },
                'segments'
            ],
            'onhover',
        )
    })

    graph.on('edge:mouseleave', ({ cell }) => {
        // cell.removeTools('onhover')
        
        cell.removeTool('onhover')
    })

    Graph.registerConnector('algo-connector', (s, e) => {
        const offset = 4
        const deltaY = Math.abs(e.y - s.y)
        const control = Math.floor((deltaY / 3) * 2)
    
        const v1 = { x: s.x, y: s.y + offset + control }
        const v2 = { x: e.x, y: e.y - offset - control }
    
        return Path.normalize(
            `M ${s.x} ${s.y}
            L ${s.x} ${s.y + offset}
            C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
            L ${e.x} ${e.y}
            `,
        )
    }, true)

}

const default_port_groups = {
    in: {
        attrs: {
            circle: {
                r: 6,
                magnet: true,
            }
        },
        position: 'top'
    },
    out: {
        attrs: {
            circle: {
                r: 6,
                magnet: true,
            }
        },
        position: 'bottom'
    },
}

export function default_node_ports(ports: Array<keyof typeof default_port_groups>) {
    const default_ports = {
        groups: default_port_groups,
        items: [] as {id: string, group: keyof typeof default_port_groups}[]
    }

    for (const port_group of ports) {
        default_ports.items.push({
            id: `${port_group}-something`,
            group: port_group,
        })
    }

    return default_ports
}

export type node_types = {
    [
        key in "start" | "notice" | "decision" | "end"
    ]: {
        antv_metadata: Node.Metadata,
        config_fields: {
            general?: string[],
            additional?: string[]
        }
    }
};
export const node_type_default = 'notice';


Graph.registerNode("vue-start", {
    inherit: "vue-shape",
    // x: 200,
    // y: 150,
    width: 150,
    height: 100,
    component: {
        template: `<div>{{ node.getData().label }}</div>`,
        inject: ["getGraph", "getNode"],
        data() {
            return {
                node: null
            }
        },
        mounted() {
            const node = this.getNode()
        }
    },
});

/*
import start from '@/components/graph/nodes/start.vue'

export const node_types: node_types = {
    // https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L112
    start: {
        antv_metadata: {
            shape: 'vue-shape',
            component: start,
            // tools: ['button-remove'],
            width: 100,
            height: 40,
            data: {
                node_type: 'start',
                options: {}
            },
            ports: default_node_ports(['out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation'
            ],
        }
    },
    decision: {
        antv_metadata: {
            shape: 'polygon',
            tools: ['button-remove'],
            width: 100,
            height: 80,
            // https://x6.antv.vision/zh/examples/node/native-node#polygon
            points: '0,10 10,0 20,10 10,20',
            attrs: {
                body: {
                    fill: '#93C5FD', // reference tailwind-css's default colors
                    stroke: '#1E3A8A',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#1E3A8A',
                    fontSize: 13,
                    textWrap: { width: 100 }
                },
            },
            data: {
                node_type: 'decision',
                options: {}
            },
            ports: default_node_ports(['in', 'out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation',
                // 'subgraph'
            ],
        }
    },
    notice: {
        antv_metadata: {
            shape: 'rect',
            tools: ['button-remove'],
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#A7F3D0', // reference tailwind-css's default colors
                    stroke: '#064E3B',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#064E3B',
                    fontSize: 13,
                    textWrap: { width: -10 }
                }
            },
            data: {
                node_type: 'notice',
                options: {}
            },
            ports: default_node_ports(['in', 'out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation'
            ],
        }
    },
    end: {
        antv_metadata: {
            shape: 'ellipse',
            tools: ['button-remove'],
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#FECACA', // reference tailwind-css's default colors
                    stroke: '#7F1D1D',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#7F1D1D',
                    fontSize: 13,
                    textWrap: { width: -10 }
                },
            },
            data: {
                node_type: 'end',
                options: {}
            },
            ports: default_node_ports(['in']),
        },
        config_fields: {
            general: [
                'label'
            ],
        }
    }
}
*/


export const node_types: node_types = {
    // https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L112
    start: {
        antv_metadata: {
            shape: 'test-vue-shape',
            tools: ['button-remove'],
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#FDE68A', // reference tailwind-css's default colors
                    stroke: '#78350F',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#78350F',
                    fontSize: 13,
                    textWrap: { width: -10 }
                },
            },
            data: {
                node_type: 'start',
                options: {}
            },
            ports: default_node_ports(['out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation'
            ],
        }
    },
    decision: {
        antv_metadata: {
            shape: 'polygon',
            tools: ['button-remove'],
            width: 100,
            height: 80,
            // https://x6.antv.vision/zh/examples/node/native-node#polygon
            points: '0,10 10,0 20,10 10,20',
            attrs: {
                body: {
                    fill: '#93C5FD', // reference tailwind-css's default colors
                    stroke: '#1E3A8A',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#1E3A8A',
                    fontSize: 13,
                    textWrap: { width: 100 }
                },
            },
            data: {
                node_type: 'decision',
                options: {}
            },
            ports: default_node_ports(['in', 'out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation',
                // 'subgraph'
            ],
        }
    },
    notice: {
        antv_metadata: {
            shape: 'rect',
            tools: ['button-remove'],
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#A7F3D0', // reference tailwind-css's default colors
                    stroke: '#064E3B',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#064E3B',
                    fontSize: 13,
                    textWrap: { width: -10 }
                }
            },
            data: {
                node_type: 'notice',
                options: {}
            },
            ports: default_node_ports(['in', 'out']),
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                // 'annotation'
            ],
        }
    },
    end: {
        antv_metadata: {
            shape: 'ellipse',
            tools: ['button-remove'],
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#FECACA', // reference tailwind-css's default colors
                    stroke: '#7F1D1D',
                    strokeWidth: 1,
                },
                label: {
                    fill: '#7F1D1D',
                    fontSize: 13,
                    textWrap: { width: -10 }
                },
            },
            data: {
                node_type: 'end',
                options: {}
            },
            ports: default_node_ports(['in']),
        },
        config_fields: {
            general: [
                'label'
            ],
        }
    }
}