import createDijkstraModule from './cpp-build/dijkstra.js';

export default async function __init__() {
    const Module = await createDijkstraModule();

    if (!Module.Graph) {
        throw new Error('Graph class not found in WASM module');
    }

    return {
        Graph: Module.Graph
    };
}