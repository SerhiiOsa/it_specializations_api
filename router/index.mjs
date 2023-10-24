import Router from 'koa-router';
import { getClient, releaseClient } from '.././db/db.mjs';

export const router = new Router();

// Get all root nodes
router.get('/tree_nodes/all', async (ctx) => {
    const client = await getClient();
    try {
        const result = await client.query('SELECT * FROM tree_nodes');
        ctx.body = result.rows;
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

// Get all root nodes
router.get('/tree_nodes/roots', async (ctx) => {
    const client = await getClient();
    try {
        const result = await client.query(
            'SELECT * FROM tree_nodes where is_root = true'
        );
        ctx.body = result.rows;
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

// Get all childs of node by ID (GET)
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

// Create a new node (POST)
router.post('/tree_nodes', async (ctx) => {
    const client = await getClient();
    try {
        const { node_name, description } = ctx.request.body;
        let { parent_id } = ctx.request.body;

        if (!parent_id) parent_id = null;
        const is_root = parent_id === null;

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, parent_id, is_root) VALUES ($1, $2, $3, $4) RETURNING node_id',
            [node_name, description, parent_id, is_root]
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
router.put('/tree_nodes/:id', async (ctx) => {
    const client = await getClient();
    try {
        const nodeId = ctx.params.id;
        const { node_name, description } = ctx.request.body;
        let { parent_id } = ctx.request.body;

        if (!parent_id) parent_id = null;
        const is_root = parent_id === null;

        const result = await client.query(
            'UPDATE tree_nodes SET node_name = $1, description = $2, parent_id = $3, is_root = $4 WHERE node_id = $5',
            [node_name, description, parent_id, is_root, nodeId]
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
router.delete('/tree_nodes/:id', async (ctx) => {
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
