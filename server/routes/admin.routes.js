const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, updateUser, deleteUser, getAllTrips } = require('../controllers/admin.controller');
const { authenticate, adminOnly } = require('../middleware/auth.middleware');

router.use(authenticate, adminOnly);
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/trips', getAllTrips);

module.exports = router;
