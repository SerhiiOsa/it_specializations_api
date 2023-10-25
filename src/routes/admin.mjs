import Router from 'koa-router';
import * as adminController from '../controllers/admin.mjs';

export const router = new Router();

// Get all nodes
router.get('/api/v1/nodes/list', adminController.getNodes);

// Get single node by ID
router.get('/api/v1/nodes/single/:id', adminController.getNodeById);

// Get all root nodes
router.get('/api/v1/nodes/roots', adminController.getRootNodes);

// Get all childs of node by ID
router.get('/api/v1/nodes/children/:id', adminController.getChildNodes);

// Get all nodes in the branch by ID
router.get('/api/v1/nodes/branch/:id', adminController.getNodesInBranch);

// Create a new root node (POST)
router.post('/api/v1/nodes/add', adminController.createRootNode);

// Create a new child node (POST)
router.post('/api/v1/nodes/add/:id', adminController.createChildNode);

// Update an existing node (PUT)
router.put('/api/v1/nodes/update/:id', adminController.updateNode);

// Delete a node by ID (DELETE)
router.delete('/api/v1/nodes/delete/:id', adminController.deleteNode);
