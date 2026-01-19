#include <iostream>
#include <vector>
#include <queue>
#include <limits>
#include <algorithm>
#include <emscripten/bind.h>

const double MAX_DIST = std::numeric_limits<double>::max();

struct Edge
{
    int node;
    double weight;
    Edge() = default;
    Edge(int _node, double _weight) : node(_node), weight(_weight) {}

    bool operator>(const Edge &e) const
    {
        return this->weight > e.weight;
    }
};

struct Graph
{
    int Nodes;
    bool bidirectional = false;
    std::vector<std::vector<Edge>> adyList;
    std::vector<double> distance;
    std::vector<int> parent;

    Graph(int _Nodes) : Nodes(_Nodes)
    {
        adyList.resize(_Nodes + 1);
    }

    void connectNodes(int u, int v, double weight = 1.0)
    {
        if (u <= 0 || v <= 0 || u > Nodes || v > Nodes)
            return;
        adyList[u].emplace_back(v, weight);
        if (bidirectional)
        {
            adyList[v].emplace_back(u, weight);
        }
    }

    double dijkstra(int start, int end)
    {
        if (start <= 0 || end <= 0 || start > Nodes || end > Nodes)
            return -1;

        distance.assign(Nodes + 1, MAX_DIST);
        parent.assign(Nodes + 1, -1);

        distance[start] = 0;
        std::priority_queue<Edge, std::vector<Edge>, std::greater<Edge>> pq;
        pq.emplace(start, 0);

        while (!pq.empty())
        {
            Edge current = pq.top();
            pq.pop();

            if (current.weight > distance[current.node])
                continue;
            if (current.node == end)
                break;

            for (const auto &edge : adyList[current.node])
            {
                if (distance[current.node] + edge.weight < distance[edge.node])
                {
                    distance[edge.node] = distance[current.node] + edge.weight;
                    parent[edge.node] = current.node;
                    pq.emplace(edge.node, distance[edge.node]);
                }
            }
        }
        return (distance[end] == MAX_DIST) ? -1 : distance[end];
    }

    std::vector<int> getPath(int start, int end)
    {
        std::vector<int> path;
        if (start <= 0 || end <= 0 || distance[end] == MAX_DIST)
            return path;

        for (int v = end; v != -1; v = parent[v])
        {
            path.push_back(v);
            if (v == start)
                break;
        }
        std::reverse(path.begin(), path.end());
        return path;
    }
};

EMSCRIPTEN_BINDINGS(graph_module)
{
    emscripten::register_vector<int>("VectorInt");

    emscripten::class_<Graph>("Graph")
        .constructor<int>()
        .property("bidirectional", &Graph::bidirectional)
        .function("connectNodes", &Graph::connectNodes)
        .function("dijkstra", &Graph::dijkstra)
        .function("getPath", &Graph::getPath);
}