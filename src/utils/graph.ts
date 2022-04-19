
import { Graph, Node } from '@antv/x6';

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

export const graph_options = {
    grid: true,

    background: {
        color: 'white'
    },

    // mousewheel: {
    //     enabled: true,
    //     modifiers: ['ctrl', 'meta'],
    // },

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
}

export const default_node_ports = {
    groups: {
        out: {
            attrs: {
                circle: {
                    r: 8,
                    magnet: true,
                }
            },
            position: 'bottom'
        },
    },
    items: [
        {
            id: 'out-1',
            group: 'out',
        },
    ]
};

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

export const node_types: node_types = {
    // https://github.com/eensander/graph-quiz/blob/master/resources/js/components/dashboard/graph/GraphModeler.vue#L112
    start: {
        antv_metadata: {
            shape: 'ellipse',
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
            ports: default_node_ports,
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                'annotation'
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
            ports: default_node_ports,
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                'annotation',
                'subgraph'
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
            ports: default_node_ports,
        },
        config_fields: {
            general: [
                'label'
            ],
            additional: [
                'annotation'
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
            // ports: default_node_ports,
        },
        config_fields: {
            general: [
                'label'
            ],
        }
    }
}