const router = require('express').Router();

const imageController = require('../controllers/image');
const { middlewareHandler } = require('../utils/promise');

// /images
router
    .route('/')
    .get(middlewareHandler(imageController.list))
    .post(middlewareHandler(imageController.build));

router
    .route('/upload-zip')
    .post(middlewareHandler(imageController.uploadZip));

module.exports = router;