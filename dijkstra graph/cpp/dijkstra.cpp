
/**
 * The above code defines a C++ struct for a graph data structure with methods for connecting nodes and
 * finding the shortest path using Dijkstra's algorithm, and it includes bindings for Emscripten to
 * expose this functionality to JavaScript.
 *
 * @param  The code you provided defines a C++ struct for a graph data structure with methods for
 * connecting nodes and finding the shortest path using Dijkstra's algorithm.
 *
 * @author Romelio Suarez Espinosa
 * @copyright Not allowed comercial use
 */
#include <iostream>
#include <queue>
#include <limits>
#include <stdexcept>
#include <algorithm>

const double MAX = std::numeric_limits<double>::max();

struct Edge
{
    int node;
    double weight;
    Edge() = default;
    Edge(int _node, double _weight) : node(_node), weight(_weight) {}

    /**
     * @details I'm not implementing a manual destructor
     * because I'm not using pointers;
     * RAII handles releasing the resources for me in this case
     **/

    bool operator>(const Edge &e) const
    {
        return this->weight > e.weight;
    }
};

/**
 * The above code defines a C++ struct for a graph data structure with methods for connecting nodes and
 * finding the shortest path using Dijkstra's algorithm.
 * @property {int} Nodes - The `Nodes` property in the `Graph` struct represents the total number of
 * nodes in the graph. It is initialized in the constructor of the `Graph` class and is used to set the
 * size of the adjacency list and distance vector.
 * @property {bool} bidirectional - The `bidirectional` property in the `Graph` struct indicates
 * whether the graph is bidirectional or not. If `bidirectional` is set to `true`, it means that edges
 * are added in both directions between connected nodes when using the `connectNodes` method. This
 * allows for modeling bidirectional
 * @property adyList - The `adyList` property in the `Graph` struct is a vector of vectors of `Edge`
 * objects. Each element in the outer vector represents a node in the graph, and the inner vector
 * contains the edges connected to that node. Each `Edge` object stores the destination node and the
 * weight
 * @property distance - The `distance` vector in the `Graph` struct represents the shortest distance
 * from a starting node to all other nodes in the graph. The `dijkstra` method in the struct calculates
 * these distances using Dijkstra's algorithm.
 */
struct Graph
{
    int Nodes;
    bool bidirectional = false;
    std::vector<std::vector<Edge>> adyList;
    std::vector<double> distance;

    Graph(int _Nodes) : Nodes(_Nodes)
    {
        adyList.resize(_Nodes + 1);
        distance.resize(_Nodes + 1, MAX);
    }

    void connectNodes(int u, int v, double weight = 1.0)
    {
        if (u == 0 || v == 0)
        {
            std::cerr << "[ERROR]: Nodes with index 0 are not valid\n";
            return;
        }
        adyList[u].emplace_back(v, weight);
        if (this->bidirectional)
            adyList[v].emplace_back(u, weight);
    }

    bool nodeExists(int node)
    {
        return (node >= 1 && node <= Nodes);
    }

    bool edgeExists(int u, int v)
    {
        if (!nodeExists(u) || !nodeExists(v))
            return false;
        for (const auto &edge : adyList[u])
        {
            if (edge.node == v)
            {
                return true;
            }
        }
        return false;
    }

    double dijkstra(int start, int end)
    {
        this->distance.resize(this->Nodes + 1, MAX);
        this->distance[start] = 0;

        std::priority_queue<Edge, std::vector<Edge>, std::greater<Edge>> pq;
        pq.emplace(start, 0);

        while (!pq.empty())
        {
            auto current = pq.top();
            pq.pop();

            if (current.weight > distance[current.node])
                continue;

            for (const auto &edge : this->adyList[current.node])
            {
                double new_dist = this->distance[current.node] + edge.weight;

                if (new_dist < this->distance[edge.node])
                {
                    this->distance[edge.node] = new_dist;
                    pq.emplace(edge.node, new_dist);
                }
            }
        }
        return this->distance[end] == MAX ? -1 : this->distance[end];
    }
};

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(dijkstra)
{
    emscripten::class_<Graph>("Graph")
        .constructor<int>()
        .property("bidirectional", &Graph::bidirectional)
        .function("connectNodes", &Graph::connectNodes)
        .function("nodeExists", &Graph::nodeExists)
        .function("edgeExists", &Graph::edgeExists)
        .function("dijkstra", &Graph::dijkstra);
}