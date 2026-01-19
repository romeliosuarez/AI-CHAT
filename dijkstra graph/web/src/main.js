import { graphBridge } from './modules/wasm/graph_bridge.js';
import NodesController from './modules/controllers/nodesController.js';
import EdgesController from './modules/controllers/edgesController.js';
import GraphTypeController from './modules/controllers/graphTypeController.js';
import GraphRenderer from './modules/renderer/graphRenderer.js';
import EdgesVisualizer from './modules/renderer/edgesVisualizer.js';

class GraphApp {
    constructor() {
        this.nodesController = null;
        this.edgesController = null;
        this.graphTypeController = null;
        this.graphRenderer = null;
        this.edgesVisualizer = null;

        this.isInitialized = false;
        this.selectedStartNode = null;
        this.selectedEndNode = null;
        this.lastResults = null;
        this.actionHistory = [];

        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando Graph App...');
            this.updateStatus('Initializing...');

            this.initializeControllers();
            await this.initializeWASM();
            this.initializeRenderer();
            this.initializeEdgesVisualizer();
            this.setupEventListeners();
            this.initializeUI();

            this.isInitialized = true;
            this.updateStatus('Ready');
            this.addLog('Application initialized successfully', 'success');
            console.log('✅ Graph App inicializado correctamente');

            this.exposeForDebugging();

        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
            this.showError(`Error de inicialización: ${error.message}`);
            this.updateStatus('Error', 'error');
        }
    }

    initializeControllers() {
        console.log('📦 Inicializando controladores...');
        this.nodesController = new NodesController();
        this.edgesController = new EdgesController();
        this.graphTypeController = new GraphTypeController();
        console.log('✅ Controladores inicializados');
    }

    async initializeWASM() {
        console.log('⚙️ Inicializando WebAssembly...');
        this.updateStatus('Loading WASM...');

        try {
            await graphBridge.initialize();
            graphBridge.createGraph(100);
            this.edgesController.setWasmBridge(graphBridge);

            const statusEl = document.getElementById('wasm-status');
            if (statusEl) {
                statusEl.className = 'status-success';
                statusEl.innerHTML = '<i class="fas fa-check-circle"></i> WASM Loaded';
            }

            console.log('✅ WebAssembly inicializado');
            this.addLog('WASM module loaded successfully', 'success');

        } catch (error) {
            console.warn('⚠️ WebAssembly no disponible, usando modo simulación');
            this.addLog('WASM not available, using simulation mode', 'warning');

            const statusEl = document.getElementById('wasm-status');
            if (statusEl) {
                statusEl.className = 'status-error';
                statusEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i> WASM Error';
            }
        }
    }

    initializeRenderer() {
        console.log('🎨 Inicializando renderizador...');
        this.graphRenderer = new GraphRenderer();
        this.graphRenderer.setOnNodeClick((nodeId) => {
            this.handleNodeClick(nodeId);
        });
        this.graphRenderer.setOnNodeDoubleClick((nodeId) => {
            this.handleNodeDoubleClick(nodeId);
        });
        console.log('✅ Renderizador inicializado');
    }

    initializeEdgesVisualizer() {
        console.log('🔗 Inicializando visualizador de conexiones...');
        this.edgesVisualizer = new EdgesVisualizer(
            this.graphRenderer,
            this.edgesController
        );
        console.log('✅ Visualizador de conexiones listo');
    }

    initializeUI() {
        console.log('🖥️ Inicializando interfaz de usuario...');
        this.updateStats();
        this.graphTypeController.setType(true, false);
        this.setupSampleButton();
        console.log('✅ Interfaz de usuario inicializada');
    }

    setupSampleButton() {
        const addSampleBtn = document.getElementById('add-sample-btn');
        if (addSampleBtn) {
            addSampleBtn.addEventListener('click', () => {
                this.addSampleGraph();
            });
        }

        const sampleGraphBtn = document.getElementById('sample-graph-btn');
        if (sampleGraphBtn) {
            sampleGraphBtn.addEventListener('click', () => {
                this.addSampleGraph();
            });
        }
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        const addNodeBtn = document.getElementById('add-node-btn');
        const nodeIdInput = document.getElementById('node-id');

        if (addNodeBtn) {
            addNodeBtn.addEventListener('click', () => {
                this.handleAddNode();
            });
        }

        if (nodeIdInput) {
            nodeIdInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleAddNode();
                }
            });
        }

        const addEdgeBtn = document.getElementById('add-edge-btn');
        if (addEdgeBtn) {
            addEdgeBtn.addEventListener('click', () => {
                this.handleAddEdge();
            });
        }

        ['from-node', 'to-node', 'edge-weight'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleAddEdge();
                    }
                });
            }
        });

        const runDijkstraBtn = document.getElementById('run-dijkstra-btn');
        if (runDijkstraBtn) {
            runDijkstraBtn.addEventListener('click', () => {
                this.handleRunDijkstra();
            });
        }

        const clearGraphBtn = document.getElementById('clear-graph-btn');
        if (clearGraphBtn) {
            clearGraphBtn.addEventListener('click', () => {
                this.handleClearGraph();
            });
        }

        const resetViewBtn = document.getElementById('reset-view-btn');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                this.graphRenderer.center();
                this.addLog('View reset to center', 'info');
            });
        }

        const graphTypeSelect = document.getElementById('graph-type');
        if (graphTypeSelect) {
            graphTypeSelect.addEventListener('change', (e) => {
                const isDirected = e.target.value === 'directed';
                this.handleGraphTypeChange(isDirected);
            });
        }

        const showConnectionsBtn = document.getElementById('show-connections');
        if (showConnectionsBtn) {
            showConnectionsBtn.addEventListener('click', () => {
                this.toggleConnections();
            });
        }

        const showMatrixBtn = document.getElementById('show-matrix');
        if (showMatrixBtn) {
            showMatrixBtn.addEventListener('click', () => {
                this.showAdjacencyMatrix();
            });
        }

        const closeMatrixBtn = document.getElementById('close-matrix');
        if (closeMatrixBtn) {
            closeMatrixBtn.addEventListener('click', () => {
                this.hideAdjacencyMatrix();
            });
        }

        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const centerBtn = document.getElementById('center-graph');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.graphRenderer.zoom(1.2));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.graphRenderer.zoom(0.8));
        if (centerBtn) centerBtn.addEventListener('click', () => this.graphRenderer.center());

        this.setupSelectionEvents();

        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeydown(e);
        });

        console.log('✅ Event listeners configurados');
    }

    setupSelectionEvents() {
        const startInput = document.getElementById('start-node');
        const endInput = document.getElementById('end-node');

        if (startInput && endInput) {
            startInput.addEventListener('change', (e) => {
                this.selectedStartNode = parseInt(e.target.value) || null;
                this.updateNodeSelection();
            });

            endInput.addEventListener('change', (e) => {
                this.selectedEndNode = parseInt(e.target.value) || null;
                this.updateNodeSelection();
            });
        }
    }

    handleGlobalKeydown(e) {
        switch (e.key) {
            case 'Escape':
                this.clearSelection();
                break;
            case 'Delete':
            case 'Backspace':
                if (e.ctrlKey) {
                    this.handleClearGraph();
                }
                break;
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleConnections();
                }
                break;
            case 'm':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.showAdjacencyMatrix();
                }
                break;
        }
    }

    handleAddNode() {
        const input = document.getElementById('node-id');
        if (!input) return;
        const nodeId = parseInt(input.value);
        try {
            if (nodeId && (nodeId < 1 || nodeId > 100)) {
                this.showError('Node ID must be between 1 and 100');
                return;
            }
            const node = this.nodesController.addNode(nodeId);
            this.addLog(`Node ${node.id} added`, 'success');
            console.log(`📌 Nodo agregado: ${node.id}`, node);
            input.value = this.nodesController.nextId;
            input.focus();
            this.renderGraph();
            this.updateStats();
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleAddEdge() {
        const fromInput = document.getElementById('from-node');
        const toInput = document.getElementById('to-node');
        const weightInput = document.getElementById('edge-weight');
        if (!fromInput || !toInput || !weightInput) return;
        const from = parseInt(fromInput.value);
        const to = parseInt(toInput.value);
        const weight = parseFloat(weightInput.value);
        if (!from || !to || !weight) {
            this.showError('Please complete all edge fields');
            return;
        }
        if (from === to) {
            this.showError('Self-loops are not allowed');
            return;
        }
        if (weight <= 0) {
            this.showError('Weight must be a positive number');
            return;
        }
        try {
            if (!this.nodesController.nodeExists(from)) {
                this.showError(`Node ${from} does not exist`);
                return;
            }
            if (!this.nodesController.nodeExists(to)) {
                this.showError(`Node ${to} does not exist`);
                return;
            }
            const isDirected = this.graphTypeController.isDirected;
            const edge = this.edgesController.createEdge(from, to, weight, isDirected);
            this.addLog(`Edge ${from} → ${to} (weight: ${weight}) added`, 'success');
            console.log(`🔗 Arista creada: ${from} → ${to} (peso: ${weight})`, edge);
            fromInput.value = '';
            toInput.value = '';
            fromInput.focus();
            this.renderGraph();
            this.updateStats();
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleGraphTypeChange(isDirected) {
        this.graphTypeController.setType(isDirected);
        const edgeHelp = document.getElementById('edge-help');
        if (edgeHelp) {
            edgeHelp.textContent = isDirected
                ? 'Directed edges: A → B means one direction'
                : 'Undirected edges: A — B means bidirectional connection';
        }
        try {
            graphBridge.setBidirectional(!isDirected);
            this.addLog(`Graph type changed to ${isDirected ? 'directed' : 'undirected'}`, 'info');
        } catch (error) {
            console.warn('Failed to update WASM bidirectional:', error);
        }
        this.renderGraph();
    }

    async handleRunDijkstra() {
        const startInput = document.getElementById('start-node');
        const endInput = document.getElementById('end-node');
        if (!startInput || !endInput) return;
        const start = parseInt(startInput.value);
        const end = parseInt(endInput.value);
        if (!start || !end) {
            this.showError('Select start and destination nodes');
            return;
        }
        if (start === end) {
            this.showError('Start and destination nodes must be different');
            return;
        }
        if (!this.nodesController.nodeExists(start)) {
            this.showError(`Start node ${start} does not exist`);
            return;
        }
        if (!this.nodesController.nodeExists(end)) {
            this.showError(`Destination node ${end} does not exist`);
            return;
        }
        try {
            console.log(`🔍 Ejecutando Dijkstra: ${start} → ${end}`);
            this.updateStatus('Running Dijkstra...');
            this.clearPreviousResults();
            const startTime = performance.now();
            const distance = await graphBridge.dijkstra(start, end);
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);
            console.log(`📊 Resultado Dijkstra: ${distance} (${executionTime}ms)`);
            this.lastResults = {
                start,
                end,
                distance,
                executionTime,
                timestamp: new Date().toISOString()
            };
            this.displayDijkstraResults(distance, executionTime);
            this.updatePathDisplay(start, end, distance);
            this.highlightStartEndNodes(start, end);
            this.addLog(`Dijkstra: ${start} → ${end} = ${distance !== -1 ? distance.toFixed(2) : 'No path'} (${executionTime}ms)`, 'info');
            this.updateStatus('Ready');
        } catch (error) {
            console.error('Error en Dijkstra:', error);
            this.showError(`Error ejecutando Dijkstra: ${error.message}`);
            this.updateStatus('Error', 'error');
        }
    }

    handleClearGraph() {
        if (!confirm('Are you sure you want to clear the entire graph?\nAll nodes and edges will be lost.')) {
            return;
        }
        console.log('🗑️ Limpiando grafo...');
        this.updateStatus('Clearing graph...');
        this.nodesController.clear();
        this.edgesController.clear();
        graphBridge.clearGraph();
        graphBridge.createGraph(100);
        this.selectedStartNode = null;
        this.selectedEndNode = null;
        this.lastResults = null;
        this.clearUI();
        this.renderGraph();
        if (this.edgesVisualizer && this.edgesVisualizer.isShowingConnections) {
            this.edgesVisualizer.hideConnections();
            const showConnectionsBtn = document.getElementById('show-connections');
            if (showConnectionsBtn) {
                showConnectionsBtn.innerHTML = '<i class="fas fa-project-diagram"></i>';
                showConnectionsBtn.title = 'Show Connections';
            }
        }
        this.addLog('Graph cleared', 'warning');
        this.updateStatus('Ready');
        console.log('✅ Grafo limpiado');
    }

    handleNodeClick(nodeId) {
        console.log(`🖱️ Nodo clickeado: ${nodeId}`);
        const isSelected = this.nodesController.toggleNodeSelection(nodeId);
        this.renderGraph();
        if (isSelected) {
            this.updateDijkstraInputs(nodeId);
        }
        this.addLog(`Node ${nodeId} ${isSelected ? 'selected' : 'deselected'}`, 'info');
    }

    handleNodeDoubleClick(nodeId) {
        console.log(`🖱️🖱️ Nodo doble clickeado: ${nodeId}`);
        const startInput = document.getElementById('start-node');
        const endInput = document.getElementById('end-node');
        if (!startInput || !endInput) return;
        if (!startInput.value) {
            startInput.value = nodeId;
            this.selectedStartNode = nodeId;
            this.addLog(`Start node set to ${nodeId}`, 'info');
        } else if (!endInput.value) {
            endInput.value = nodeId;
            this.selectedEndNode = nodeId;
            this.addLog(`End node set to ${nodeId}`, 'info');
        } else {
            startInput.value = nodeId;
            endInput.value = '';
            this.selectedStartNode = nodeId;
            this.selectedEndNode = null;
            this.addLog(`Start node reset to ${nodeId}`, 'info');
        }
        this.updateNodeSelection();
    }

    renderGraph() {
        if (!this.graphRenderer) return;
        const nodes = this.nodesController.getAllNodes();
        const edges = this.edgesController.getAllEdgesForVisualization();
        this.graphRenderer.render(nodes, edges);
    }

    updateNodeSelection() {
        this.nodesController.getAllNodes().forEach(node => {
            if (node.isSelected &&
                node.id !== this.selectedStartNode &&
                node.id !== this.selectedEndNode) {
                node.isSelected = false;
                node.color = '#4361ee';
            }
        });
        if (this.selectedStartNode) {
            const startNode = this.nodesController.getNode(this.selectedStartNode);
            if (startNode) {
                startNode.isSelected = true;
                startNode.color = '#4cc9f0';
            }
        }
        if (this.selectedEndNode) {
            const endNode = this.nodesController.getNode(this.selectedEndNode);
            if (endNode) {
                endNode.isSelected = true;
                endNode.color = '#f72585';
            }
        }
        this.renderGraph();
    }

    highlightStartEndNodes(start, end) {
        const startNode = this.nodesController.getNode(start);
        const endNode = this.nodesController.getNode(end);
        if (startNode) {
            startNode.color = '#4cc9f0';
            startNode.isSelected = true;
        }
        if (endNode) {
            endNode.color = '#f72585';
            endNode.isSelected = true;
        }
        this.renderGraph();
    }

    clearPreviousResults() {
        this.graphRenderer.resetHighlights();
        this.nodesController.getAllNodes().forEach(node => {
            if (node.id !== this.selectedStartNode && node.id !== this.selectedEndNode) {
                node.color = '#4361ee';
            }
        });
        this.renderGraph();
    }

    clearSelection() {
        this.selectedStartNode = null;
        this.selectedEndNode = null;
        const startInput = document.getElementById('start-node');
        const endInput = document.getElementById('end-node');
        if (startInput) startInput.value = '';
        if (endInput) endInput.value = '';
        this.updateNodeSelection();
        this.addLog('Selection cleared', 'info');
    }

    toggleConnections() {
        if (!this.edgesVisualizer) return;
        const showConnectionsBtn = document.getElementById('show-connections');
        if (this.edgesVisualizer.isShowingConnections) {
            this.edgesVisualizer.hideConnections();
            if (showConnectionsBtn) {
                showConnectionsBtn.innerHTML = '<i class="fas fa-project-diagram"></i>';
                showConnectionsBtn.title = 'Show Connections';
            }
            this.addLog('Connections hidden', 'info');
        } else {
            this.edgesVisualizer.showAllConnections();
            if (showConnectionsBtn) {
                showConnectionsBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
                showConnectionsBtn.title = 'Hide Connections';
            }
            this.addLog('Connections shown', 'info');
        }
    }

    showAdjacencyMatrix() {
        if (!this.edgesVisualizer) return;
        this.edgesVisualizer.showAdjacencyMatrix();
        this.addLog('Adjacency matrix displayed', 'info');
        const modal = document.getElementById('matrix-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideAdjacencyMatrix() {
        const modal = document.getElementById('matrix-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateStats() {
        const nodeStats = this.nodesController.getStats();
        const edgeStats = this.edgesController.getStats();
        const nodeCountEl = document.getElementById('node-count');
        const edgeCountEl = document.getElementById('edge-count');
        if (nodeCountEl) nodeCountEl.textContent = nodeStats.total;
        if (edgeCountEl) edgeCountEl.textContent = edgeStats.unique;
        const graphTypeDisplay = document.getElementById('graph-type-display');
        if (graphTypeDisplay) {
            graphTypeDisplay.textContent = this.graphTypeController.isDirected ?
                'Directed' : 'Undirected';
        }
        this.updateGraphMetrics(nodeStats.total, edgeStats.unique);
        const connectionsEl = document.getElementById('node-connections');
        if (connectionsEl) {
            connectionsEl.textContent = `Connections: ${edgeStats.unique}`;
        }
    }

    updateGraphMetrics(nodeCount, edgeCount) {
        const maxEdges = nodeCount * (nodeCount - 1) / 2;
        const density = maxEdges > 0 ? ((edgeCount / maxEdges) * 100).toFixed(1) : '0';
        const densityEl = document.getElementById('graph-density');
        if (densityEl) {
            densityEl.textContent = `${density}%`;
        }
        const avgDegree = nodeCount > 0 ? (edgeCount * 2 / nodeCount).toFixed(1) : '0';
        const avgDegreeEl = document.getElementById('avg-degree');
        if (avgDegreeEl) {
            avgDegreeEl.textContent = avgDegree;
        }
    }

    displayDijkstraResults(distance, executionTime) {
        const distanceEl = document.getElementById('distance-result');
        const timeEl = document.getElementById('time-result');
        const execTimeEl = document.getElementById('execution-time');
        if (distanceEl) {
            if (distance === -1) {
                distanceEl.textContent = 'No path';
                distanceEl.style.color = 'var(--danger-color)';
            } else {
                distanceEl.textContent = distance.toFixed(2);
                distanceEl.style.color = 'var(--success-color)';
            }
        }
        if (timeEl) {
            timeEl.textContent = `${executionTime} ms`;
        }
        if (execTimeEl) {
            execTimeEl.textContent = `Execution time: ${executionTime} ms`;
            execTimeEl.style.display = 'block';
        }
    }

    updatePathDisplay(start, end, distance) {
        const pathEl = document.getElementById('path-result');
        const path = graphBridge.getPath(start, end);
        const n = path.size();
        const arr = [];

        for (let i = 0; i < n; i++) {
            arr.push(path.get(i));
        }

        path.delete();

        console.log(path);
        if (!pathEl) return;
        if (distance === -1) {
            pathEl.textContent = `No path from ${start} to ${end}`;
            pathEl.style.color = 'var(--danger-color)';
        } else {
            pathEl.textContent = `Path: ${arr.join(' → ')}`;
            pathEl.style.color = 'var(--success-color)';
        }
    }

    updateDijkstraInputs(nodeId) {
        const startInput = document.getElementById('start-node');
        const endInput = document.getElementById('end-node');
        if (!startInput || !endInput) return;
        if (!startInput.value) {
            startInput.value = nodeId;
            this.selectedStartNode = nodeId;
            this.addLog(`Start node set to ${nodeId} via click`, 'info');
        } else if (!endInput.value) {
            endInput.value = nodeId;
            this.selectedEndNode = nodeId;
            this.addLog(`End node set to ${nodeId} via click`, 'info');
        } else {
            startInput.value = nodeId;
            endInput.value = '';
            this.selectedStartNode = nodeId;
            this.selectedEndNode = null;
            this.addLog(`Start node reset to ${nodeId} via click`, 'info');
        }
        this.updateNodeSelection();
    }

    clearUI() {
        const inputs = ['node-id', 'from-node', 'to-node', 'edge-weight', 'start-node', 'end-node'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        const nodeIdInput = document.getElementById('node-id');
        if (nodeIdInput) {
            nodeIdInput.value = this.nodesController.nextId;
        }
        const results = ['distance-result', 'path-result', 'time-result'];
        results.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = '-';
                el.style.color = '';
            }
        });
        const execTimeEl = document.getElementById('execution-time');
        if (execTimeEl) {
            execTimeEl.style.display = 'none';
        }
        this.updateStats();
    }

    addLog(message, type = 'info') {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;
        const icon = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        }[type] || 'fa-info-circle';
        const color = {
            info: '#3498db',
            success: '#2ecc71',
            warning: '#f1c40f',
            error: '#e74c3c'
        }[type] || '#3498db';
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry fade-in';
        logEntry.innerHTML = `
            <i class="fas ${icon}" style="color: ${color}"></i>
            <span>${message}</span>
            <span class="log-time">${this.getCurrentTime()}</span>
        `;
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        while (logContainer.children.length > 10) {
            logContainer.removeChild(logContainer.lastChild);
        }
        this.actionHistory.push({
            message,
            type,
            timestamp: new Date().toISOString()
        });
    }

    updateStatus(status, type = 'info') {
        const statusEl = document.getElementById('graph-status');
        if (statusEl) {
            statusEl.textContent = `Status: ${status}`;
            statusEl.style.color = {
                info: 'var(--info-color)',
                success: 'var(--success-color)',
                warning: 'var(--warning-color)',
                error: 'var(--danger-color)'
            }[type] || 'var(--info-color)';
        }
    }

    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    addSampleGraph() {
        console.log('📊 Agregando grafo de ejemplo...');
        this.updateStatus('Creating sample graph...');
        try {
            this.handleClearGraph();
            setTimeout(() => {
                const nodePositions = [
                    { id: 1, x: 200, y: 150 },
                    { id: 2, x: 400, y: 100 },
                    { id: 3, x: 400, y: 200 },
                    { id: 4, x: 600, y: 150 },
                    { id: 5, x: 300, y: 300 },
                    { id: 6, x: 500, y: 300 }
                ];
                nodePositions.forEach(pos => {
                    this.nodesController.addNode(pos.id, { x: pos.x, y: pos.y });
                });
                const edges = [
                    { from: 1, to: 2, weight: 4 },
                    { from: 1, to: 3, weight: 2 },
                    { from: 2, to: 3, weight: 1 },
                    { from: 2, to: 4, weight: 5 },
                    { from: 3, to: 4, weight: 8 },
                    { from: 3, to: 5, weight: 10 },
                    { from: 4, to: 6, weight: 2 },
                    { from: 5, to: 6, weight: 3 },
                    { from: 1, to: 5, weight: 7 }
                ];
                const isDirected = this.graphTypeController.isDirected;
                edges.forEach(edge => {
                    this.edgesController.createEdge(
                        edge.from,
                        edge.to,
                        edge.weight,
                        isDirected
                    );
                });
                this.renderGraph();
                this.updateStats();
                document.getElementById('start-node').value = 1;
                document.getElementById('end-node').value = 6;
                this.selectedStartNode = 1;
                this.selectedEndNode = 6;
                this.updateNodeSelection();
                this.addLog('Sample graph loaded successfully', 'success');
                this.updateStatus('Ready');
                console.log('✅ Grafo de ejemplo agregado');
            }, 100);
        } catch (error) {
            console.error('Error agregando grafo de ejemplo:', error);
            this.showError('Error loading sample graph: ' + error.message);
            this.updateStatus('Error', 'error');
        }
    }

    showError(message) {
        console.error('❌ Error:', message);
        this.addLog(message, 'error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification fade-in';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-color);
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius-sm);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: var(--box-shadow-lg);
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            errorDiv.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => errorDiv.remove(), 300);
        }, 4000);
    }

    exposeForDebugging() {
        window.app = this;
        window.nodesController = this.nodesController;
        window.edgesController = this.edgesController;
        window.graphRenderer = this.graphRenderer;
        window.graphBridge = graphBridge;
        window.edgesVisualizer = this.edgesVisualizer;
        console.log('🐛 Depuración habilitada');
        console.log('Comandos disponibles:');
        console.log('- app.getGraphInfo()');
        console.log('- app.addSampleGraph()');
        console.log('- nodesController.getAllNodes()');
        console.log('- edgesController.getAllEdges()');
        console.log('- graphBridge.getGraphInfo()');
        console.log('- edgesVisualizer.showAllConnections()');
    }

    getGraphInfo() {
        return {
            nodes: this.nodesController.getStats(),
            edges: this.edgesController.getStats(),
            type: this.graphTypeController.getTypeObject(),
            wasm: graphBridge.getGraphInfo(),
            renderer: this.graphRenderer.getState(),
            lastResults: this.lastResults
        };
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .error-notification {
        font-family: var(--font-family);
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease;
    }
    
    .slide-in-right {
        animation: slideInRight 0.3s ease;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando aplicación...');
    const app = new GraphApp();
    window.graphApp = app;
});