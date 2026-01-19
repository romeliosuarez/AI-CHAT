export default class PathCalculator {
    constructor(nodesController, edgesController) {
        this.nodes = nodesController;
        this.edges = edgesController;
    }

    calculatePath(start, end) {
        const nodes = this.nodes.getAllNodes().map(n => n.id);
        const edges = this.edges.getAllEdges();

        const distances = {};
        const previous = {};
        const visited = new Set();
        const unvisited = new Set(nodes);

        nodes.forEach(node => {
            distances[node] = node === start ? 0 : Infinity;
            previous[node] = null;
        });

        while (unvisited.size > 0) {
            let current = null;
            let minDistance = Infinity;

            unvisited.forEach(node => {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    current = node;
                }
            });

            if (current === null || current === end) break;

            unvisited.delete(current);
            visited.add(current);

            const neighbors = edges.filter(edge =>
                edge.from === current && !visited.has(edge.to)
            );

            neighbors.forEach(edge => {
                const newDistance = distances[current] + edge.weight;
                if (newDistance < distances[edge.to]) {
                    distances[edge.to] = newDistance;
                    previous[edge.to] = current;
                }
            });
        }

        const path = [];
        let current = end;

        while (current !== null) {
            path.unshift(current);
            current = previous[current];
        }

        const hasPath = distances[end] !== Infinity;

        return {
            distance: hasPath ? distances[end] : -1,
            path: hasPath ? path : [],
            valid: hasPath
        };
    }

    formatPath(path) {
        if (path.length === 0) return 'No path found';
        return path.join(' → ');
    }
}