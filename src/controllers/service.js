const Dockerode = require('dockerode');

const Image = require('../models/image');

const docker = new Dockerode({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });

module.exports.createService = async (req, res, next) => {
    let { imageId, cpu, ram, storage, name } = req.body;
    let volume = await docker.createVolume({
        Driver: 'local',
        DriverOpts: {}
    });
    let image = await Image.findByPk(imageId);
    
    docker.createService({
        Mode: {
            Replicated: {
                Replicas: 1
            }
        },
        EndpointSpec: {
            Mode: "vip",
            Ports: [
                {
                    Protocol: 'tcp',
                    TargetPort: image.imageExposedPort,
                    PublishMode: 'ingress'
                }
            ]
        },
        TaskTemplate: {
            ContainerSpec: {
                Hostname: name,
                Mounts: [
                    {
                        Source: volume.name,
                        Target: image.imageWorkDir,
                        Type: 'volume',
                        ReadOnly: false,
                        VolumeOptions: {
                            DriverConfig: {
                                Name: 'cio',
                                Options: {}
                            }
                        }
                    }
                ],
                Image: image.imageRepoTags[0]
            }
        }
    })
};