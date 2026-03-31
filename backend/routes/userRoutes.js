import express from 'express';
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

const adminOrManager = roleMiddleware(['admin', 'manager']);

router.get('/', userController.getAllUsers);
router.get('/managers', userController.getManagers);
router.get('/:id', userController.getUserById);

router.post('/', adminOrManager, userController.addUser);
router.put('/:id', adminOrManager, userController.updateUser);
router.delete('/:id', adminOrManager, userController.deleteUser);

export default router;
