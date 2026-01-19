/* The GraphTypeController class manages the type of a graph (directed or undirected) and provides
methods for updating the UI and notifying subscribers of changes. */
export default class GraphTypeController {
    constructor() {
        this.isDirected = true;
        this.subscribers = [];
        this.initFromDOM();
    }

    initFromDOM() {
        const select = document.getElementById('graph-type');
        if (select) {
            this.isDirected = select.value === 'directed';
            select.addEventListener('change', (e) => {
                this.setType(e.target.value === 'directed', true);
            });
        }
    }

    setType(directed, notify = true) {
        const oldType = this.isDirected;
        this.isDirected = directed;
        this.updateUI();
        if (notify && oldType !== directed) {
            this.notifySubscribers(directed);
        }
    }

    updateUI() {
        const select = document.getElementById('graph-type');
        if (select) {
            select.value = this.isDirected ? 'directed' : 'undirected';
        }

        const display = document.getElementById('graph-type-display');
        if (display) {
            display.textContent = this.isDirected ? 'Directed' : 'Undirected';
        }

        this.updateHelpText();
    }

    updateHelpText() {
        const edgeHelp = document.querySelector('.edge-help');
        if (edgeHelp) {
            edgeHelp.textContent = this.isDirected
                ? 'Aristas dirigidas: A → B significa dirección única'
                : 'Aristas no dirigidas: A — B significa conexión bidireccional';
        }
    }

    subscribe(callback) {
        if (typeof callback === 'function') {
            this.subscribers.push(callback);
        }
    }

    unsubscribe(callback) {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
            this.subscribers.splice(index, 1);
        }
    }

    notifySubscribers(newType) {
        this.subscribers.forEach(callback => {
            try {
                callback(newType);
            } catch (error) {
                console.error('Error in graph type callback:', error);
            }
        });
    }

    getTypeString() {
        return this.isDirected ? 'directed' : 'undirected';
    }

    getTypeObject() {
        return {
            isDirected: this.isDirected,
            type: this.isDirected ? 'directed' : 'undirected',
            description: this.isDirected
                ? 'Aristas con dirección definida'
                : 'Aristas bidireccionales'
        };
    }

    toggle() {
        this.setType(!this.isDirected, true);
    }

    isType(type) {
        return type === 'directed' ? this.isDirected : !this.isDirected;
    }

    applyToEdge(edge) {
        return {
            ...edge,
            isDirected: this.isDirected,
            arrow: this.isDirected ? '→' : '—'
        };
    }
}