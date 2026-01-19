// public/js/modules/visualization/edgesVisualizer.js

/**
 * Visualizador especializado para mostrar conexiones de aristas
 */
export default class EdgesVisualizer {
    constructor(graphRenderer, edgesController) {
        this.graphRenderer = graphRenderer;
        this.edgesController = edgesController;
        this.connectionsGroup = null;
        this.isShowingConnections = false;
        this.highlightedNode = null;
        this.connectionLines = new Map();
        this.connectionLabels = new Map();

        this.init();
    }

    init() {
        this.createConnectionsGroup();
        this.createConnectionArrow();
        this.setupTooltipStyles();
    }

    createConnectionsGroup() {
        const svg = document.getElementById('graph-svg');
        if (!svg) return;

        this.connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsGroup.id = 'connections-group';
        this.connectionsGroup.style.display = 'none';

        const edgesGroup = document.getElementById('edges-group');
        if (edgesGroup) {
            edgesGroup.parentNode.insertBefore(this.connectionsGroup, edgesGroup.nextSibling);
        } else {
            svg.appendChild(this.connectionsGroup);
        }
    }

    createConnectionArrow() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        arrow.setAttribute('id', 'connection-arrow');
        arrow.setAttribute('markerWidth', '10');
        arrow.setAttribute('markerHeight', '7');
        arrow.setAttribute('refX', '8');
        arrow.setAttribute('refY', '3.5');
        arrow.setAttribute('orient', 'auto');
        arrow.setAttribute('markerUnits', 'strokeWidth');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 8 3.5, 0 7');
        polygon.setAttribute('fill', '#4cc9f0');

        arrow.appendChild(polygon);
        defs.appendChild(arrow);

        const arrowIncoming = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        arrowIncoming.setAttribute('id', 'connection-arrow-incoming');
        arrowIncoming.setAttribute('markerWidth', '10');
        arrowIncoming.setAttribute('markerHeight', '7');
        arrowIncoming.setAttribute('refX', '2');
        arrowIncoming.setAttribute('refY', '3.5');
        arrow.setAttribute('orient', 'auto');
        arrow.setAttribute('markerUnits', 'strokeWidth');

        const polygonIncoming = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygonIncoming.setAttribute('points', '8 0, 0 3.5, 8 7');
        polygonIncoming.setAttribute('fill', '#f8961e');

        arrowIncoming.appendChild(polygonIncoming);
        defs.appendChild(arrowIncoming);

        this.connectionsGroup.appendChild(defs);
    }

    setupTooltipStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .edge-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                z-index: 10000;
                pointer-events: none;
                transform: translate(-50%, -100%);
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .edge-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.9);
            }
            
            .tooltip-content {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .tooltip-content strong {
                color: #4cc9f0;
            }
            
            .connection-highlight {
                animation: pulse-connection 2s infinite;
            }
            
            @keyframes pulse-connection {
                0%, 100% {
                    stroke-opacity: 0.6;
                }
                50% {
                    stroke-opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showAllConnections() {
        if (!this.connectionsGroup) return;

        this.clearConnections();
        this.isShowingConnections = true;
        this.connectionsGroup.style.display = 'block';

        const nodes = this.getNodesData();
        const edges = this.edgesController.getAllEdges();

        nodes.forEach(node => {
            this.showNodeConnections(node.id);
        });

        this.addEdgeTooltips();
    }

    showNodeConnections(nodeId) {
        if (!this.connectionsGroup) return;

        const node = this.getNodeData(nodeId);
        if (!node) return;

        const edges = this.edgesController.getEdgesByNode(nodeId);

        edges.forEach(edge => {
            this.highlightConnection(edge, nodeId);
        });

        this.highlightedNode = nodeId;
    }

    highlightConnection(edge, sourceNodeId) {
        const fromNode = this.getNodeData(edge.from);
        const toNode = this.getNodeData(edge.to);
        if (!fromNode || !toNode) return;

        const isOutgoing = edge.from === sourceNodeId;
        const isIncoming = edge.to === sourceNodeId;

        let color, arrowId;
        if (isOutgoing) {
            color = '#4cc9f0';
            arrowId = 'connection-arrow';
        } else if (isIncoming) {
            color = '#f8961e';
            arrowId = 'connection-arrow-incoming';
        } else {
            color = '#4361ee';
            arrowId = null;
        }

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const angle = Math.atan2(dy, dx);
        const radius = 20;

        const startX = fromNode.x + (radius * Math.cos(angle));
        const startY = fromNode.y + (radius * Math.sin(angle));
        const endX = toNode.x - (radius * Math.cos(angle));
        const endY = toNode.y - (radius * Math.sin(angle));

        const lineId = `${edge.from}-${edge.to}-${sourceNodeId}`;
        const line = this.createConnectionLine(startX, startY, endX, endY, color, arrowId, lineId);

        this.createConnectionLabel(edge, fromNode, toNode, color, lineId);

        this.highlightConnectedNode(edge.from, color);
        this.highlightConnectedNode(edge.to, color);

        this.connectionLines.set(lineId, line);
    }

    createConnectionLine(x1, y1, x2, y2, color, arrowId, lineId) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'connection-line connection-highlight');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '4');
        line.setAttribute('stroke-opacity', '0.7');
        line.setAttribute('data-line-id', lineId);

        if (arrowId) {
            line.setAttribute('marker-end', `url(#${arrowId})`);
        }

        if (color === '#4361ee') {
            line.setAttribute('stroke-dasharray', '5,3');
        }

        this.connectionsGroup.appendChild(line);
        return line;
    }

    createConnectionLabel(edge, fromNode, toNode, color, lineId) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;

        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const angle = Math.atan2(dy, dx);
        const textOffset = 25;
        const textX = midX - textOffset * Math.sin(angle);
        const textY = midY + textOffset * Math.cos(angle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'connection-label');
        text.setAttribute('fill', color);
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('data-label-id', lineId);
        text.setAttribute('stroke', 'white');
        text.setAttribute('stroke-width', '3');
        text.setAttribute('stroke-opacity', '0.8');
        text.setAttribute('paint-order', 'stroke');

        let label = `w:${edge.weight.toFixed(1)}`;
        if (edge.isDirected) {
            label = `${edge.from}→${edge.to} ${label}`;
        } else {
            label = `${edge.from}↔${edge.to} ${label}`;
        }

        text.textContent = label;
        this.connectionsGroup.appendChild(text);

        this.connectionLabels.set(lineId, text);
    }

    highlightConnectedNode(nodeId, color) {
        const circle = document.querySelector(`circle[data-node-id="${nodeId}"]`);
        if (circle) {
            if (!circle.getAttribute('data-original-fill')) {
                circle.setAttribute('data-original-fill', circle.getAttribute('fill'));
            }

            const lightenedColor = this.lightenColor(color, 40);
            circle.setAttribute('fill', lightenedColor);
            circle.setAttribute('stroke', color);
            circle.setAttribute('stroke-width', '3');

            circle.setAttribute('filter', 'url(#connection-glow)');
        }
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return "#" + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }

    addEdgeTooltips() {
        setTimeout(() => {
            const edges = document.querySelectorAll('.graph-edge');

            edges.forEach(edge => {
                edge.addEventListener('mouseenter', (e) => {
                    const from = e.target.getAttribute('data-from');
                    const to = e.target.getAttribute('data-to');
                    this.showEdgeDetails(from, to);
                });

                edge.addEventListener('mouseleave', () => {
                    this.hideEdgeDetails();
                });
            });
        }, 100);
    }

    showEdgeDetails(from, to) {
        this.hideEdgeDetails();

        const edge = this.edgesController.getEdgeObject(from, to);
        if (!edge) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'edge-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <strong>${edge.isDirected ? 'Directed Edge' : 'Undirected Edge'}</strong>
                <div>${edge.from} ${edge.isDirected ? '→' : '↔'} ${edge.to}</div>
                <div>Weight: ${edge.weight.toFixed(2)}</div>
                <div>Click to select nodes</div>
            </div>
        `;

        tooltip.id = 'edge-tooltip';

        const edgeElement = document.querySelector(`line[data-from="${from}"][data-to="${to}"]`);
        if (edgeElement) {
            const rect = edgeElement.getBoundingClientRect();
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            tooltip.style.left = `${rect.left + rect.width / 2 + scrollLeft}px`;
            tooltip.style.top = `${rect.top - 10 + scrollTop}px`;
        }

        document.body.appendChild(tooltip);

        this.highlightEdge(from, to);
    }

    highlightEdge(from, to) {
        const edgeLine = document.querySelector(`line[data-from="${from}"][data-to="${to}"]`);
        if (edgeLine) {
            edgeLine.setAttribute('stroke-width', '4');
            edgeLine.setAttribute('stroke', '#f72585');
            edgeLine.style.filter = 'drop-shadow(0 0 8px rgba(247, 37, 133, 0.5))';
        }

        [from, to].forEach(nodeId => {
            const circle = document.querySelector(`circle[data-node-id="${nodeId}"]`);
            if (circle) {
                circle.setAttribute('stroke', '#f72585');
                circle.setAttribute('stroke-width', '3');
                circle.style.filter = 'drop-shadow(0 0 6px rgba(247, 37, 133, 0.5))';
            }
        });
    }

    hideEdgeDetails() {
        const tooltip = document.getElementById('edge-tooltip');
        if (tooltip) tooltip.remove();

        if (!this.isShowingConnections) {
            const edges = document.querySelectorAll('.graph-edge');
            edges.forEach(edge => {
                edge.setAttribute('stroke-width', '2');
                edge.setAttribute('stroke', '#4361ee');
                edge.style.filter = 'none';
            });

            const nodes = document.querySelectorAll('.graph-node');
            nodes.forEach(node => {
                node.setAttribute('stroke', '#3a0ca3');
                node.setAttribute('stroke-width', '2');
                node.style.filter = 'none';
            });
        }
    }

    showAdjacencyMatrix() {
        const nodes = this.getNodesData();
        const edges = this.edgesController.getAllEdges();

        const matrix = this.createAdjacencyMatrix(nodes, edges);
        this.displayMatrixModal(matrix, nodes);
    }

    createAdjacencyMatrix(nodes, edges) {
        const size = nodes.length;
        const matrix = Array(size).fill().map(() => Array(size).fill(0));

        const idToIndex = {};
        const indexToId = {};
        nodes.forEach((node, index) => {
            idToIndex[node.id] = index;
            indexToId[index] = node.id;
        });

        edges.forEach(edge => {
            const i = idToIndex[edge.from];
            const j = idToIndex[edge.to];
            if (i !== undefined && j !== undefined) {
                matrix[i][j] = edge.weight;
                if (!edge.isDirected && i !== j) {
                    matrix[j][i] = edge.weight;
                }
            }
        });

        return { matrix, indexToId };
    }

    displayMatrixModal(matrixData, nodes) {
        const { matrix, indexToId } = matrixData;

        let html = '<table class="adjacency-matrix">';
        html += '<thead><tr><th></th>';
        nodes.forEach(node => {
            html += `<th>${node.id}</th>`;
        });
        html += '</tr></thead>';

        html += '<tbody>';
        matrix.forEach((row, i) => {
            html += `<tr><th>${indexToId[i]}</th>`;
            row.forEach((cell, j) => {
                const value = cell === 0 ? '0' : cell.toFixed(1);
                const cellClass = cell !== 0 ? 'highlight' : '';
                html += `<td class="${cellClass}">${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        const matrixContainer = document.getElementById('matrix-container');
        if (matrixContainer) {
            matrixContainer.innerHTML = html;

            const style = document.createElement('style');
            style.textContent = `
                .adjacency-matrix {
                    border-collapse: collapse;
                    width: 100%;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                }
                
                .adjacency-matrix th,
                .adjacency-matrix td {
                    border: 1px solid #dee2e6;
                    padding: 8px;
                    text-align: center;
                    min-width: 40px;
                }
                
                .adjacency-matrix th {
                    background: linear-gradient(135deg, #4361ee, #3a0ca3);
                    color: white;
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                }
                
                .adjacency-matrix td {
                    background: white;
                    transition: all 0.2s ease;
                }
                
                .adjacency-matrix tr:hover td {
                    background: rgba(67, 97, 238, 0.05);
                }
                
                .adjacency-matrix td.highlight {
                    background: rgba(76, 201, 240, 0.1);
                    color: #4361ee;
                    font-weight: 700;
                }
                
                .adjacency-matrix td:not(:empty):hover {
                    transform: scale(1.1);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
            `;
            matrixContainer.appendChild(style);

            setTimeout(() => {
                this.addMatrixCellEvents(matrix, indexToId);
            }, 100);
        }
    }

    addMatrixCellEvents(matrix, indexToId) {
        const cells = document.querySelectorAll('.adjacency-matrix td');

        cells.forEach((cell, index) => {
            const row = Math.floor(index / matrix.length);
            const col = index % matrix.length;

            if (matrix[row][col] !== 0) {
                cell.addEventListener('mouseenter', () => {
                    const fromId = indexToId[row];
                    const toId = indexToId[col];
                    this.highlightMatrixConnection(fromId, toId);
                });

                cell.addEventListener('mouseleave', () => {
                    this.unhighlightMatrixConnection();
                });
            }
        });
    }

    highlightMatrixConnection(fromId, toId) {
        const edgeLine = document.querySelector(`line[data-from="${fromId}"][data-to="${toId}"]`);
        if (edgeLine) {
            edgeLine.setAttribute('stroke', '#f72585');
            edgeLine.setAttribute('stroke-width', '4');
            edgeLine.style.filter = 'drop-shadow(0 0 8px rgba(247, 37, 133, 0.5))';
        }

        [fromId, toId].forEach(nodeId => {
            const circle = document.querySelector(`circle[data-node-id="${nodeId}"]`);
            if (circle) {
                circle.setAttribute('stroke', '#f72585');
                circle.setAttribute('stroke-width', '3');
                circle.style.filter = 'drop-shadow(0 0 6px rgba(247, 37, 133, 0.5))';
            }
        });
    }

    unhighlightMatrixConnection() {
        if (!this.isShowingConnections) {
            const edges = document.querySelectorAll('.graph-edge');
            edges.forEach(edge => {
                edge.setAttribute('stroke', '#4361ee');
                edge.setAttribute('stroke-width', '2');
                edge.style.filter = 'none';
            });

            const nodes = document.querySelectorAll('.graph-node');
            nodes.forEach(node => {
                node.setAttribute('stroke', '#3a0ca3');
                node.setAttribute('stroke-width', '2');
                node.style.filter = 'none';
            });
        }
    }

    getNodesData() {
        if (this.graphRenderer && this.graphRenderer.getNodesData) {
            return this.graphRenderer.getNodesData();
        }

        const nodes = [];
        const circles = document.querySelectorAll('circle[data-node-id]');
        circles.forEach(circle => {
            nodes.push({
                id: parseInt(circle.getAttribute('data-node-id')),
                x: parseFloat(circle.getAttribute('cx')),
                y: parseFloat(circle.getAttribute('cy'))
            });
        });
        return nodes;
    }

    getNodeData(nodeId) {
        const nodes = this.getNodesData();
        return nodes.find(node => node.id === nodeId);
    }

    toggleConnections() {
        if (this.isShowingConnections) {
            this.hideConnections();
        } else {
            this.showAllConnections();
        }
    }

    hideConnections() {
        if (!this.connectionsGroup) return;

        this.isShowingConnections = false;
        this.connectionsGroup.style.display = 'none';
        this.clearConnections();
        this.restoreOriginalColors();
        this.hideEdgeDetails();
        this.highlightedNode = null;
    }

    clearConnections() {
        if (this.connectionsGroup) {
            this.connectionsGroup.innerHTML = '';
        }
        this.connectionLines.clear();
        this.connectionLabels.clear();
        this.createConnectionArrow();
    }

    restoreOriginalColors() {
        const nodes = document.querySelectorAll('.graph-node');
        nodes.forEach(node => {
            const originalColor = node.getAttribute('data-original-fill');
            if (originalColor) {
                node.setAttribute('fill', originalColor);
                node.removeAttribute('data-original-fill');
            }
            node.setAttribute('stroke', '#3a0ca3');
            node.setAttribute('stroke-width', '2');
            node.removeAttribute('filter');
        });

        const edges = document.querySelectorAll('.graph-edge');
        edges.forEach(edge => {
            edge.setAttribute('stroke', '#4361ee');
            edge.setAttribute('stroke-width', '2');
            edge.style.filter = 'none';
        });
    }

    updateConnections() {
        if (this.isShowingConnections) {
            this.hideConnections();
            this.showAllConnections();
        }
    }

    showNodeDegrees() {
        const nodes = this.getNodesData();

        nodes.forEach(node => {
            const edges = this.edgesController.getEdgesByNode(node.id);
            const degree = edges.length;

            const circle = document.querySelector(`circle[data-node-id="${node.id}"]`);
            if (circle) {
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', parseFloat(circle.getAttribute('cx')));
                label.setAttribute('y', parseFloat(circle.getAttribute('cy')) + 35);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('fill', '#6c757d');
                label.setAttribute('font-size', '10px');
                label.setAttribute('font-weight', 'bold');
                label.textContent = `deg: ${degree}`;
                label.setAttribute('data-degree-label', node.id);

                this.connectionsGroup.appendChild(label);
            }
        });
    }

    highlightEdgesByWeight(minWeight, maxWeight) {
        const edges = this.edgesController.getAllEdges();

        edges.forEach(edge => {
            if (edge.weight >= minWeight && edge.weight <= maxWeight) {
                const line = document.querySelector(`line[data-from="${edge.from}"][data-to="${edge.to}"]`);
                if (line) {
                    line.setAttribute('stroke', '#f72585');
                    line.setAttribute('stroke-width', '3');
                    line.style.filter = 'drop-shadow(0 0 6px rgba(247, 37, 133, 0.5))';
                }
            }
        });
    }

    showDiagnostics() {
        const nodes = this.getNodesData();
        const edges = this.edgesController.getAllEdges();

        console.log('=== Graph Diagnostics ===');
        console.log(`Nodes: ${nodes.length}`);
        console.log(`Edges: ${edges.length}`);
        console.log(`Directed: ${edges.some(e => e.isDirected)}`);

        const maxEdges = nodes.length * (nodes.length - 1) / 2;
        const density = maxEdges > 0 ? (edges.length / maxEdges * 100).toFixed(1) : 0;
        console.log(`Density: ${density}%`);

        const isolatedNodes = nodes.filter(node => {
            const nodeEdges = edges.filter(e => e.from === node.id || e.to === node.id);
            return nodeEdges.length === 0;
        });

        if (isolatedNodes.length > 0) {
            console.log(`Isolated nodes: ${isolatedNodes.map(n => n.id).join(', ')}`);
        }

        const zeroWeightEdges = edges.filter(e => e.weight === 0);
        if (zeroWeightEdges.length > 0) {
            console.log(`Zero-weight edges: ${zeroWeightEdges.map(e => `${e.from}→${e.to}`).join(', ')}`);
        }
    }
}