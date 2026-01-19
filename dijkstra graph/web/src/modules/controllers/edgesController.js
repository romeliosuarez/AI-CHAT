/* The `EdgesController` class manages edges in a graph visualization, allowing for the creation,
retrieval, updating, and removal of edges, as well as providing statistics and path highlighting
functionality. */
export default class EdgesController {
    constructor() {
        this.edges = [];
        this.edgeIdCounter = 1;
        this.wasmBridge = null;
    }

    setWasmBridge(bridge) {
        this.wasmBridge = bridge;
    }

    createEdge(from, to, weight, isDirected = true) {
        if (from === to) {
            throw new Error('Self-loops not allowed');
        }

        if (weight <= 0) {
            throw new Error('Weight must be positive');
        }

        if (this.edgeExists(from, to)) {
            throw new Error(`Edge ${from} -> ${to} already exists in visualization`);
        }

        const edge = {
            id: this.edgeIdCounter++,
            from: from,
            to: to,
            weight: weight,
            isDirected: isDirected,
            color: '#4361ee',
            strokeWidth: 2,
            isHighlighted: false,
            createdAt: new Date().toISOString()
        };

        this.edges.push(edge);

        if (!isDirected) {
            const reverseEdge = {
                id: this.edgeIdCounter++,
                from: to,
                to: from,
                weight: weight,
                isDirected: false,
                color: '#4361ee',
                strokeWidth: 2,
                isHighlighted: false,
                isReverse: true,
                createdAt: new Date().toISOString()
            };
            this.edges.push(reverseEdge);
        }

        if (this.wasmBridge) {
            try {
                this.wasmBridge.connectNodes(from, to, weight);
                if (!isDirected) {
                    this.wasmBridge.connectNodes(to, from, weight);
                }
            } catch (error) {
                console.warn('Failed to connect in WASM:', error);
            }
        }

        return edge;
    }

    getEdgeObject(from, to) {
        return this.edges.find(e =>
            e.from === from && e.to === to && !e.isReverse
        );
    }

    edgeExists(from, to) {
        return this.edges.some(e =>
            e.from === from && e.to === to && !e.isReverse
        );
    }

    getAllEdges() {
        return this.edges.filter(e => !e.isReverse);
    }

    getAllEdgesForVisualization() {
        return [...this.edges];
    }

    getEdgesByNode(nodeId) {
        return this.edges.filter(e =>
            (e.from === nodeId || e.to === nodeId) && !e.isReverse
        );
    }

    updateEdge(id, updates) {
        const edge = this.edges.find(e => e.id === id);
        if (!edge) return null;

        Object.assign(edge, updates);
        return edge;
    }

    removeEdge(from, to) {
        const initialLength = this.edges.length;

        this.edges = this.edges.filter(e =>
            !(e.from === from && e.to === to) &&
            !(e.from === to && e.to === from && e.isReverse)
        );

        return this.edges.length < initialLength;
    }

    clear() {
        this.edges = [];
        this.edgeIdCounter = 1;
    }

    highlightPath(pathNodes) {
        this.edges.forEach(edge => {
            edge.isHighlighted = false;
            edge.color = '#4361ee';
            edge.strokeWidth = 2;
        });

        for (let i = 0; i < pathNodes.length - 1; i++) {
            const from = pathNodes[i];
            const to = pathNodes[i + 1];

            const edge = this.edges.find(e =>
                (e.from === from && e.to === to) ||
                (!e.isDirected && e.from === to && e.to === from)
            );

            if (edge) {
                edge.isHighlighted = true;
                edge.color = '#f72585';
                edge.strokeWidth = 3;
            }
        }
    }

    getStats() {
        const uniqueEdges = new Set();
        this.edges.forEach(edge => {
            if (!edge.isReverse) {
                const key = `${Math.min(edge.from, edge.to)}-${Math.max(edge.from, edge.to)}`;
                uniqueEdges.add(key);
            }
        });

        return {
            total: this.edges.length,
            unique: uniqueEdges.size,
            directed: this.edges.filter(e => e.isDirected && !e.isReverse).length,
            undirected: this.edges.filter(e => !e.isDirected && !e.isReverse).length
        };
    }
}