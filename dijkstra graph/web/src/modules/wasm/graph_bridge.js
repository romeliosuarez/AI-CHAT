import __init__ from '../../cpp-build/dijkstra.js';

export default class GraphBridge {
    constructor() {
        this.Graph = null;
        this.currentGraph = null;
        this.isInitialized = false;
        this.moduleInstance = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('Loading WASM module...');

            this.moduleInstance = await __init__();

            this.Graph = this.moduleInstance.Graph;

            if (!this.Graph) {
                throw new Error('Graph class not found in WASM module');
            }

            this.isInitialized = true;
            console.log('WASM Graph loaded successfully:', this.Graph);
            return true;

        } catch (error) {
            console.error('Failed to load WASM module:', error);
            throw error;
        }
    }

    createGraph(maxNodes = 1000) {
        if (!this.isInitialized) {
            throw new Error('WASM not initialized. Call initialize() first.');
        }

        if (!this.Graph || typeof this.Graph !== 'function') {
            throw new Error('Graph constructor not available');
        }

        try {
            this.currentGraph = new this.Graph(maxNodes);
            console.log('Graph created with', maxNodes, 'max nodes:', this.currentGraph);
            return this.currentGraph;
        } catch (error) {
            console.error('Error creating graph:', error);
            throw error;
        }
    }

    connectNodes(from, to, weight = 1.0) {
        if (!this.currentGraph) {
            throw new Error('No graph created. Call createGraph() first.');
        }

        if (!this.currentGraph.connectNodes) {
            throw new Error('connectNodes method not available on graph instance');
        }

        try {
            this.currentGraph.connectNodes(from, to, weight);
            console.log(`Connected nodes ${from} -> ${to} with weight ${weight}`);
            return true;
        } catch (error) {
            console.error('Error connecting nodes:', error);
            throw error;
        }
    }

    async dijkstra(start, end) {
        if (!this.currentGraph) {
            throw new Error('No graph created. Call createGraph() first.');
        }

        if (!this.currentGraph.dijkstra) {
            throw new Error('dijkstra method not available on graph instance');
        }

        try {
            const result = this.currentGraph.dijkstra(start, end);
            console.log(`Dijkstra ${start} -> ${end} = ${result}`);
            return result;
        } catch (error) {
            console.error('Error executing dijkstra:', error);
            throw error;
        }
    }

    getPath(start, end) {
        if (!this.currentGraph) {
            throw new Error('No graph created. Call createGraph() first.');
        }

        return this.currentGraph.getPath(start, end);
    }

    nodeExists(nodeId) {
        if (!this.currentGraph || !this.currentGraph.nodeExists) {
            return false;
        }

        try {
            return this.currentGraph.nodeExists(nodeId);
        } catch (error) {
            console.error('Error checking node existence:', error);
            return false;
        }
    }

    edgeExists(from, to) {
        if (!this.currentGraph || !this.currentGraph.edgeExists) {
            return false;
        }

        try {
            return this.currentGraph.edgeExists(from, to);
        } catch (error) {
            console.error('Error checking edge existence:', error);
            return false;
        }
    }

    setBidirectional(bidirectional) {
        if (!this.currentGraph) {
            throw new Error('No graph created');
        }

        if (typeof this.currentGraph.bidirectional === 'undefined') {
            throw new Error('bidirectional property not available');
        }

        try {
            this.currentGraph.bidirectional = bidirectional;
            console.log('Set bidirectional to:', bidirectional);
        } catch (error) {
            console.error('Error setting bidirectional:', error);
            throw error;
        }
    }

    clearGraph() {
        this.currentGraph = null;
        console.log('Graph cleared');
    }

    getGraphInfo() {
        if (!this.currentGraph) return 'No graph created';

        return {
            type: 'WASM Graph',
            hasMethods: {
                connectNodes: !!this.currentGraph.connectNodes,
                dijkstra: !!this.currentGraph.dijkstra,
                nodeExists: !!this.currentGraph.nodeExists,
                edgeExists: !!this.currentGraph.edgeExists,
                bidirectional: typeof this.currentGraph.bidirectional
            }
        };
    }
}

export const graphBridge = new GraphBridge();