#include "dijkstra.cpp"

int main()
{

    int nodes, edges, int query;
    std::cin >> nodes >> edges >> query;
    Graph g(nodes);
    g.bidirectional = true;
    for (int i = 0; i < edges; i++)
    {
        int u, v;
        double c;
        std::cin >> u >> v >> c;
        g.connectNodes(u, v, c);
    }

    for (int i = 1; i <= query; i++)
    {
        int u, v;
        std::cin >> u >> v;
    }
}