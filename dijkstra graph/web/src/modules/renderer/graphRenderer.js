/* The `GraphRenderer` class is responsible for rendering and interacting with a graph visualization in
an SVG element, providing methods for zooming, panning, highlighting paths, and handling node and
edge interactions. */
export default class GraphRenderer {
    constructor() {
        this.svg = null;
        this.nodesGroup = null;
        this.edgesGroup = null;
        this.labelsGroup = null;
        this.defsGroup = null;

        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        this.nodeRadius = 20;
        this.edgeStrokeWidth = 2;
        this.highlightedStrokeWidth = 4;

        this.init();
    }

    init() {
        this.svg = document.getElementById('graph-svg');
        if (!this.svg) {
            console.error('SVG element not found');
            return;
        }

        this.createSVGGroups();
        this.createArrowMarker();
        this.setupEventListeners();

        console.log('GraphRenderer initialized');
    }

    createSVGGroups() {
        this.svg.innerHTML = '';

        this.defsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svg.appendChild(this.defsGroup);

        this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.edgesGroup.id = 'edges-group';
        this.svg.appendChild(this.edgesGroup);

        this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesGroup.id = 'nodes-group';
        this.svg.appendChild(this.nodesGroup);

        this.labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.labelsGroup.id = 'labels-group';
        this.svg.appendChild(this.labelsGroup);
    }

    createArrowMarker() {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#4361ee');

        marker.appendChild(polygon);
        this.defsGroup.appendChild(marker);
    }

    setupEventListeners() {
        if (!this.svg) return;

        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(zoomFactor);
        });

        this.svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.startDrag(e);
            }
        });

        this.svg.addEventListener('mousemove', (e) => {
            this.drag(e);
        });

        this.svg.addEventListener('mouseup', () => {
            this.endDrag();
        });

        this.svg.addEventListener('mouseleave', () => {
            this.endDrag();
        });

        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const centerBtn = document.getElementById('center-graph');

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => this.zoom(1.2));
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => this.zoom(0.8));
        }

        if (centerBtn) {
            centerBtn.addEventListener('click', () => this.center());
        }
    }

    render(nodes = [], edges = []) {
        if (!this.svg || !this.nodesGroup || !this.edgesGroup || !this.labelsGroup) {
            console.error('Renderer not properly initialized');
            return;
        }

        this.clearGroups();
        this.updateEmptyState(nodes.length === 0);

        if (nodes.length === 0) return;

        edges.forEach(edge => this.renderEdge(edge));
        nodes.forEach(node => this.renderNode(node));
        this.applyTransformations();
    }

    renderNode(node) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', node.radius || this.nodeRadius);
        circle.setAttribute('class', 'graph-node');
        circle.setAttribute('data-node-id', node.id);
        circle.setAttribute('fill', node.color || '#4361ee');
        circle.setAttribute('stroke', node.isSelected ? '#f8961e' : '#3a0ca3');
        circle.setAttribute('stroke-width', node.isSelected ? '3' : '2');
        circle.setAttribute('stroke-opacity', '0.8');

        if (node.isSelected) {
            circle.setAttribute('filter', 'url(#glow)');
        }

        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onNodeClick?.(node.id);
        });

        circle.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.onNodeDoubleClick?.(node.id);
        });

        this.nodesGroup.appendChild(circle);
        this.renderNodeLabel(node);
    }

    renderNodeLabel(node) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.setAttribute('class', 'node-label');
        text.setAttribute('data-node-id', node.id);
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '14px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('pointer-events', 'none');
        text.setAttribute('user-select', 'none');
        text.setAttribute('stroke', 'rgba(0, 0, 0, 0.3)');
        text.setAttribute('stroke-width', '1');
        text.setAttribute('paint-order', 'stroke');
        text.textContent = node.label || node.id;
        this.labelsGroup.appendChild(text);
    }

    renderEdge(edge) {
        const fromNode = this.findNodePosition(edge.from);
        const toNode = this.findNodePosition(edge.to);

        if (!fromNode || !toNode) {
            console.warn(`Cannot render edge ${edge.from}->${edge.to}: nodes not found`);
            return;
        }

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const angle = Math.atan2(dy, dx);
        const startX = fromNode.x + (this.nodeRadius * Math.cos(angle));
        const startY = fromNode.y + (this.nodeRadius * Math.sin(angle));
        const endX = toNode.x - (this.nodeRadius * Math.cos(angle));
        const endY = toNode.y - (this.nodeRadius * Math.sin(angle));

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('class', 'graph-edge');
        line.setAttribute('data-edge-id', edge.id);
        line.setAttribute('data-from', edge.from);
        line.setAttribute('data-to', edge.to);
        line.setAttribute('stroke', edge.color || '#4361ee');
        line.setAttribute('stroke-width', edge.isHighlighted ? this.highlightedStrokeWidth : this.edgeStrokeWidth);
        line.setAttribute('stroke-opacity', '0.8');

        if (edge.isDirected && !edge.isReverse) {
            line.setAttribute('marker-end', 'url(#arrowhead)');
        }

        if (edge.isHighlighted) {
            line.setAttribute('filter', 'url(#glow)');
            line.setAttribute('stroke-linecap', 'round');
        }

        this.edgesGroup.appendChild(line);
        this.renderEdgeWeight(edge, startX, startY, endX, endY, angle);
    }

    renderEdgeWeight(edge, x1, y1, x2, y2, angle) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const textOffset = 20;
        const textX = midX - textOffset * Math.sin(angle);
        const textY = midY + textOffset * Math.cos(angle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'edge-weight');
        text.setAttribute('data-edge-id', edge.id);
        text.setAttribute('fill', edge.isHighlighted ? '#f72585' : '#495057');
        text.setAttribute('font-size', edge.isHighlighted ? '13px' : '12px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('pointer-events', 'none');
        text.setAttribute('user-select', 'none');
        text.setAttribute('stroke', 'white');
        text.setAttribute('stroke-width', '3');
        text.setAttribute('stroke-opacity', '0.7');
        text.setAttribute('paint-order', 'stroke');
        text.textContent = edge.weight.toFixed(1);
        this.labelsGroup.appendChild(text);
    }

    findNodePosition(nodeId) {
        const circle = this.nodesGroup.querySelector(`circle[data-node-id="${nodeId}"]`);
        if (!circle) return null;
        return {
            x: parseFloat(circle.getAttribute('cx')),
            y: parseFloat(circle.getAttribute('cy'))
        };
    }

    updateEmptyState(isEmpty) {
        const emptyState = document.querySelector('.graph-empty-state');
        if (emptyState) {
            emptyState.style.display = isEmpty ? 'flex' : 'none';
        }
    }

    clearGroups() {
        if (this.edgesGroup) this.edgesGroup.innerHTML = '';
        if (this.nodesGroup) this.nodesGroup.innerHTML = '';
        if (this.labelsGroup) this.labelsGroup.innerHTML = '';
        this.createArrowMarker();
    }

    applyTransformations() {
        if (!this.svg) return;

        const transformGroup = document.getElementById('transform-group') || this.createTransformGroup();
        const rect = this.svg.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const transform = `
            translate(${centerX + this.panOffset.x}, ${centerY + this.panOffset.y})
            scale(${this.zoomLevel})
            translate(${-centerX}, ${-centerY})
        `;
        transformGroup.setAttribute('transform', transform);
    }

    createTransformGroup() {
        const transformGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        transformGroup.id = 'transform-group';
        const groups = ['edges-group', 'nodes-group', 'labels-group'];
        groups.forEach(groupId => {
            const group = document.getElementById(groupId);
            if (group) {
                transformGroup.appendChild(group);
            }
        });
        this.svg.appendChild(transformGroup);
        return transformGroup;
    }

    zoom(factor) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel *= factor;
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel));
        if (oldZoom !== this.zoomLevel) {
            this.applyTransformations();
        }
    }

    startDrag(e) {
        this.isDragging = true;
        this.dragStart = {
            x: e.clientX - this.panOffset.x,
            y: e.clientY - this.panOffset.y
        };
        this.svg.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        this.panOffset = {
            x: e.clientX - this.dragStart.x,
            y: e.clientY - this.dragStart.y
        };
        this.applyTransformations();
    }

    endDrag() {
        this.isDragging = false;
        this.svg.style.cursor = 'default';
    }

    center() {
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.applyTransformations();
    }

    highlightPath(pathNodes, edges) {
        this.resetHighlights();
        pathNodes.forEach(nodeId => {
            const circle = this.nodesGroup.querySelector(`circle[data-node-id="${nodeId}"]`);
            if (circle) {
                circle.setAttribute('fill', '#f72585');
                circle.setAttribute('stroke', '#d1145a');
                circle.setAttribute('stroke-width', '3');
                circle.setAttribute('filter', 'url(#glow)');
            }
            const label = this.labelsGroup.querySelector(`text[data-node-id="${nodeId}"]`);
            if (label) {
                label.setAttribute('fill', 'white');
            }
        });

        for (let i = 0; i < pathNodes.length - 1; i++) {
            const from = pathNodes[i];
            const to = pathNodes[i + 1];
            const line = this.edgesGroup.querySelector(
                `line[data-from="${from}"][data-to="${to}"]`
            ) || this.edgesGroup.querySelector(
                `line[data-from="${to}"][data-to="${from}"]`
            );

            if (line) {
                line.setAttribute('stroke', '#f72585');
                line.setAttribute('stroke-width', this.highlightedStrokeWidth);
                line.setAttribute('filter', 'url(#glow)');
                const weightText = this.labelsGroup.querySelector(
                    `text[data-edge-id="${line.getAttribute('data-edge-id')}"]`
                );
                if (weightText) {
                    weightText.setAttribute('fill', '#f72585');
                    weightText.setAttribute('font-size', '13px');
                }
            }
        }
    }

    resetHighlights() {
        this.nodesGroup.querySelectorAll('circle').forEach(circle => {
            circle.setAttribute('fill', '#4361ee');
            circle.setAttribute('stroke', '#3a0ca3');
            circle.setAttribute('stroke-width', '2');
            circle.removeAttribute('filter');
        });

        this.labelsGroup.querySelectorAll('.node-label').forEach(label => {
            label.setAttribute('fill', 'white');
        });

        this.edgesGroup.querySelectorAll('line').forEach(line => {
            line.setAttribute('stroke', '#4361ee');
            line.setAttribute('stroke-width', this.edgeStrokeWidth);
            line.removeAttribute('filter');
        });

        this.labelsGroup.querySelectorAll('.edge-weight').forEach(text => {
            text.setAttribute('fill', '#495057');
            text.setAttribute('font-size', '12px');
        });
    }

    setOnNodeClick(callback) {
        this.onNodeClick = callback;
    }

    setOnNodeDoubleClick(callback) {
        this.onNodeDoubleClick = callback;
    }

    updateNodePosition(nodeId, x, y) {
        const circle = this.nodesGroup.querySelector(`circle[data-node-id="${nodeId}"]`);
        const label = this.labelsGroup.querySelector(`text[data-node-id="${nodeId}"]`);
        if (circle) {
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
        }
        if (label) {
            label.setAttribute('x', x);
            label.setAttribute('y', y);
        }
        this.updateConnectedEdges(nodeId);
    }

    updateConnectedEdges(nodeId) {
        const edges = this.edgesGroup.querySelectorAll(
            `line[data-from="${nodeId}"], line[data-to="${nodeId}"]`
        );
        edges.forEach(line => {
            const from = line.getAttribute('data-from');
            const to = line.getAttribute('data-to');
            const fromNode = this.findNodePosition(parseInt(from));
            const toNode = this.findNodePosition(parseInt(to));
            if (fromNode && toNode) {
                const dx = toNode.x - fromNode.x;
                const dy = toNode.y - fromNode.y;
                const angle = Math.atan2(dy, dx);
                const startX = fromNode.x + (this.nodeRadius * Math.cos(angle));
                const startY = fromNode.y + (this.nodeRadius * Math.sin(angle));
                const endX = toNode.x - (this.nodeRadius * Math.cos(angle));
                const endY = toNode.y - (this.nodeRadius * Math.sin(angle));
                line.setAttribute('x1', startX);
                line.setAttribute('y1', startY);
                line.setAttribute('x2', endX);
                line.setAttribute('y2', endY);
                this.updateEdgeWeightPosition(line, startX, startY, endX, endY, angle);
            }
        });
    }

    updateEdgeWeightPosition(line, x1, y1, x2, y2, angle) {
        const edgeId = line.getAttribute('data-edge-id');
        const weightText = this.labelsGroup.querySelector(`text[data-edge-id="${edgeId}"]`);
        if (!weightText) return;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const textOffset = 20;
        const textX = midX - textOffset * Math.sin(angle);
        const textY = midY + textOffset * Math.cos(angle);
        weightText.setAttribute('x', textX);
        weightText.setAttribute('y', textY);
    }

    getState() {
        return {
            zoomLevel: this.zoomLevel,
            panOffset: this.panOffset,
            isDragging: this.isDragging
        };
    }
}