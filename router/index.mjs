import Router from 'koa-router';
import { getClient, releaseClient } from '.././db/db.mjs';
import { formatNodes } from './treeNodeHelpers.mjs';

export const router = new Router();

// Get all nodes
router.get('/tree_nodes/all', async (ctx) => {
    const client = await getClient();
    try {
        const result = await client.query('SELECT * FROM tree_nodes');

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
});

// Get single node by ID
router.get('/tree_nodes/all/:id', async (ctx) => {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT * FROM tree_nodes WHERE node_id = $1',
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
});

// Get all root nodes
router.get('/tree_nodes/roots', async (ctx) => {
    const client = await getClient();
    try {
        const result = await client.query(
            'SELECT * FROM tree_nodes where is_root = true'
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
});

// Get all childs of node by ID
router.get('/tree_nodes/childs/:id', async (ctx) => {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT * FROM tree_nodes WHERE parent_id = $1',
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
});

// Get all nodes in the branch by ID
router.get('/tree_nodes/branch/:id', async (ctx) => {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;

        const selectedNodeQuery = await client.query(
            'SELECT * FROM tree_nodes WHERE node_id = $1',
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
});

// Create a new root node (POST)
router.post('/tree_nodes/add', async (ctx) => {
    const client = await getClient();
    try {
        const { node_name, description } = ctx.request.body;
        const parent_id = null;
        const is_root = true;
        const node_level = 0;
        const creation_date = new Date();

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, creation_date, parent_id, is_root, node_level)' +
                ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING node_id',
            [
                node_name,
                description,
                creation_date,
                parent_id,
                is_root,
                node_level,
            ]
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
});

// Create a new child node (POST)
router.post('/tree_nodes/add/:parent_id', async (ctx) => {
    const client = await getClient();
    try {
        const { node_name, description } = ctx.request.body;
        const parent_id = ctx.params.parent_id;
        const is_root = false;
        const parentLevelQuery = await client.query(
            'SELECT node_level from tree_nodes WHERE node_id = $1',
            [parent_id]
        );

        const node_level = 1 + parentLevelQuery.rows[0].node_level;
        const creation_date = new Date();

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, creation_date, parent_id, is_root, node_level)' +
                ' VALUES ($1, $2, $3, $4, $5, $6) RETURNING node_id',
            [
                node_name,
                description,
                creation_date,
                parent_id,
                is_root,
                node_level,
            ]
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
});

// Update an existing node (PUT)
router.put('/tree_nodes/update/:id', async (ctx) => {
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
});

// Delete a node by ID (DELETE)
router.delete('/tree_nodes/delete/:id', async (ctx) => {
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
});
