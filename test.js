const Dockerode = require('dockerode');

require('dotenv');

require('./src/configs/sequelize').getSequelize().sync();

const Image = require('./src/models/image');

const docker = new Dockerode({ host: 'http://127.0.0.1', port: 2375 });

(async () => {
    let volume = await docker.createVolume({
        Driver: 'local',
        DriverOpts: {}
    });
    let image = await Image.findByPk('cb1684b6-f548-4ed0-8e97-b120f9a967f5');

    await docker.createService({
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
                                Name: 'local',
                                Options: {}
                            }
                        }
                    }
                ],
                Image: image.imageRepoTags[0]
            },
            Resources: {
                Limits: {
                    NanoCPUs: 30_000_000,
                    MemoryBytes: 1_000_000_000
                }
            }
        }
    })
})();