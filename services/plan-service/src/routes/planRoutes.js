
const express = require('express');
const router = express.Router();
const { createPlan, getAvailablePlans,getAllAvailablePlans, insertMultiplePlans } = require('../controllers/planController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncWrapper = require('../../../../shared/utils/asyncWrapper'); 
const { filterPlans } = require('../controllers/filterController'); 

router.post('/create', authMiddleware, asyncWrapper(createPlan));
router.post('/createMany', asyncWrapper(insertMultiplePlans));
router.get('/', authMiddleware, asyncWrapper(getAvailablePlans));
router.get('/getAllPlansOfAllUsers', authMiddleware, asyncWrapper(getAllAvailablePlans));

router.get('/filter', authMiddleware, asyncWrapper(filterPlans));


module.exports = router;
