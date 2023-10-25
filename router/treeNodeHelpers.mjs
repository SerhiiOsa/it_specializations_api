import { getClient, releaseClient } from '.././db/db.mjs';

export async function formatNodes(node) {
    const formattedNode = { ...node };

    const children = await fetchChildren(node.node_id);

    if (children.length > 0) {
        formattedNode.children = await Promise.all(children.map(formatNodes));
    } else {
        formattedNode.children = [];
    }

    return formattedNode;
}

export async function fetchChildren(nodeId) {
    const client = await getClient();
    const result = await client.query(
        'SELECT * FROM tree_nodes WHERE parent_id = $1',
        [nodeId]
    );
    releaseClient(client);
    return result.rows;
}
