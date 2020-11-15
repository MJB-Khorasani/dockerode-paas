const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Image = require('../models/image');
const sequelize = require('../configs/sequelize');

(async function () { 
    await sequelize.getSequelize().sync({ force: true });
    require('./image')(Image);
})();