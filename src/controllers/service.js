const Dockerode = require('dockerode');
const docker = new Dockerode({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });

module.exports.createService = async (req, res, next) => {
    let { name, }
};