import { getClient, releaseClient } from '../db/db.mjs';
import { formatNodes } from '../controllers/treeNodeHelpers.mjs';

// Get all nodes
export async function getNodes(ctx) {
    const client = await getClient();
    try {
        const result = await client.query(
            'SELECT node_id, node_name, description, creation_date, parent_id, is_root, node_level FROM tree_nodes'
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Nodes not found',
            };
        } else {
            ctx.body = {
                success: true,
                data: result.rows,
            };
        }
    } catch (error) {
        console.error('Error retrieving tree_nodes', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: 'Error retrieving tree_nodes',
        };
    } finally {
        releaseClient(client);
    }
}

// Get single node by ID
export async function getNodeById(ctx) {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT node_id, node_name, description, creation_date, parent_id, is_root, node_level' +
                ' FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
        } else {
            ctx.body = {
                success: true,
                data: result.rows,
            };
        }
    } catch (error) {
        console.error('Error retrieving a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error retrieving a node' };
    } finally {
        releaseClient(client);
    }
}

// Get all root nodes
export async function getRootNodes(ctx) {
    const client = await getClient();
    try {
        const result = await client.query(
            'SELECT node_id, node_name, description, creation_date, parent_id, is_root, node_level' +
                ' FROM tree_nodes where is_root = true'
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Nodes not found',
            };
        } else {
            ctx.body = {
                success: true,
                data: result.rows,
            };
        }
    } catch (error) {
        console.error('Error retrieving tree_nodes', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: 'Error retrieving tree_nodes',
        };
    } finally {
        releaseClient(client);
    }
}

// Get all childs of node by ID
export async function getChildNodes(ctx) {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT node_id, node_name, description, creation_date, parent_id, is_root, node_level' +
                ' FROM tree_nodes WHERE parent_id = $1',
            [nodeId]
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Nodes not found',
            };
        } else {
            ctx.body = {
                success: true,
                data: result.rows,
            };
        }
    } catch (error) {
        console.error('Error retrieving a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error retrieving a node' };
    } finally {
        releaseClient(client);
    }
}

// Get all nodes in the branch by ID
export async function getNodesInBranch(ctx) {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;

        const selectedNodeQuery = await client.query(
            'SELECT node_id, node_name, description, creation_date, parent_id, is_root, node_level' +
                ' FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        if (selectedNodeQuery.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Selected node not found',
            };
            return;
        }

        const selectedNode = selectedNodeQuery.rows[0];

        const result = await formatNodes(selectedNode);

        ctx.body = {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error('Error retrieving nodes in the branch', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error retrieving nodes' };
    } finally {
        releaseClient(client);
    }
}

// Create a new root node (POST)
export async function createRootNode(ctx) {
    const client = await getClient();
    try {
        const { node_name, description } = ctx.request.body;
        const parentId = null;
        const isRoot = true;
        const nodeLevel = 0;
        const creationDate = new Date();

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, creation_date, parent_id, is_root, node_level)' +
                ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING node_id',
            [node_name, description, creationDate, parentId, isRoot, nodeLevel]
        );

        ctx.body = {
            success: true,
            message: 'Node successfully created',
            nodeId: result.rows[0].node_id,
        };
    } catch (error) {
        console.error('Error creating a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error creating a node' };
    } finally {
        releaseClient(client);
    }
}

// Create a new child node (POST)
export async function createChildNode(ctx) {
    const client = await getClient();
    try {
        const { node_name, description } = ctx.request.body;
        const parentId = ctx.params.id;
        const isRoot = false;
        const parentLevelQuery = await client.query(
            'SELECT node_level from tree_nodes WHERE node_id = $1',
            [parentId]
        );

        const nodeLevel = 1 + parentLevelQuery.rows[0].node_level;
        const creationDate = new Date();

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, creation_date, parent_id, is_root, node_level)' +
                ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING node_id',
            [node_name, description, creationDate, parentId, isRoot, nodeLevel]
        );

        ctx.body = {
            success: true,
            message: 'Node successfully created',
            nodeId: result.rows[0].node_id,
        };
    } catch (error) {
        console.error('Error creating a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error creating a node' };
    } finally {
        releaseClient(client);
    }
}

// Update an existing node (PUT)
export async function updateNode(ctx) {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const { node_name, description } = ctx.request.body;

        const result = await client.query(
            'UPDATE tree_nodes SET node_name = $1, description = $2 WHERE node_id = $3',
            [node_name, description, nodeId]
        );

        if (result.rowCount === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
        } else {
            ctx.body = {
                success: true,
                message: 'Node successfully updated',
            };
        }
    } catch (error) {
        console.error('Error updating a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error updating a node' };
    } finally {
        releaseClient(client);
    }
}

// Delete a node by ID (DELETE)
export async function deleteNode(ctx) {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'DELETE FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        if (result.rowCount > 0) {
            ctx.status = 200;
            ctx.body = {
                success: true,
                message: 'Node successfully deleted',
            };
        } else {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
        }
    } catch (error) {
        console.error('Error deleting a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error deleting a node' };
    } finally {
        releaseClient(client);
    }
}
