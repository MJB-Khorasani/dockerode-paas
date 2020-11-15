const router = require('express').Router();

const serviceController = require('../controllers/service');
const { middlewareHandler } = require('../utils/promise');

// /services
router
    .route('/')
    .post(middlewareHandler(serviceController))

module.exports = router;