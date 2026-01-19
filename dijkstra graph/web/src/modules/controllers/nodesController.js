/* The NodesController class manages a collection of nodes for visualization, allowing for adding,
updating, selecting, and removing nodes. */
export default class NodesController {
    constructor() {
        this.nodes = [];
        this.selectedNodeId = null;
        this.nextId = 1;
    }

    addNode(id = null, options = {}) {
        if (id === null || id < 1) {
            id = this.nextId++;
        } else {
            this.nextId = Math.max(this.nextId, id + 1);
        }

        if (this.getNode(id)) {
            throw new Error(`Node ${id} already exists in visualization`);
        }

        const node = {
            id: id,
            x: options.x || this.getRandomX(),
            y: options.y || this.getRandomY(),
            label: options.label || id.toString(),
            color: options.color || '#4361ee',
            radius: options.radius || 20,
            isSelected: false,
            type: options.type || 'default'
        };

        this.nodes.push(node);

        console.log('Node added to visualization:', node);
        return node;
    }

    getNode(id) {
        return this.nodes.find(node => node.id === id);
    }

    getAllNodes() {
        return [...this.nodes];
    }

    getNodesByFilter(filterFn) {
        return this.nodes.filter(filterFn);
    }

    updateNode(id, updates) {
        const node = this.getNode(id);
        if (!node) return null;

        Object.assign(node, updates);
        return node;
    }


    toggleNodeSelection(id) {
        const node = this.getNode(id);
        if (!node) return false;

        if (this.selectedNodeId && this.selectedNodeId !== id) {
            const prevNode = this.getNode(this.selectedNodeId);
            if (prevNode) {
                prevNode.isSelected = false;
                prevNode.color = '#4361ee';
            }
        }

        node.isSelected = !node.isSelected;
        node.color = node.isSelected ? '#f8961e' : '#4361ee';

        this.selectedNodeId = node.isSelected ? id : null;
        return node.isSelected;
    }


    removeNode(id) {
        const index = this.nodes.findIndex(node => node.id === id);
        if (index === -1) return false;

        this.nodes.splice(index, 1);

        if (this.selectedNodeId === id) {
            this.selectedNodeId = null;
        }

        return true;
    }


    clear() {
        this.nodes = [];
        this.selectedNodeId = null;
        this.nextId = 1;
    }

    getStats() {
        return {
            total: this.nodes.length,
            selected: this.selectedNodeId ? 1 : 0,
            ids: this.nodes.map(n => n.id),
            nextId: this.nextId
        };
    }

    exportForWASM() {
        return this.nodes.map(node => ({
            id: node.id,
        }));
    }

    getRandomX() {
        const svg = document.getElementById('graph-svg');
        if (!svg) return 100;
        const rect = svg.getBoundingClientRect();
        return Math.random() * (rect.width - 100) + 50;
    }

    getRandomY() {
        const svg = document.getElementById('graph-svg');
        if (!svg) return 100;
        const rect = svg.getBoundingClientRect();
        return Math.random() * (rect.height - 100) + 50;
    }


    nodeExists(id) {
        return this.nodes.some(node => node.id === id);
    }
}