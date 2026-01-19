import createDijkstraModule from './cpp-build/dijkstra.js';

export default async function __init__() {
    const Module = await createDijkstraModule();

    return {
        Graph: Module.Graph
    };
}