const crypto = require('crypto');

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
    let Env;

    switch (image.imageRepoTags[0].split(':')[0]) {
        case 'mysql':
            Env = [
                `MYSQL_ROOT_PASSWORD=${crypto.randomBytes(12).toString('hex')}`,
                `MYSQL_DATABASE=${crypto.randomBytes(6).toString('hex')}`
            ]
            break;
        case 'postgres':
            Env = [
                `POSTGRES_PASSWORD=${crypto.randomBytes(12).toString('hex')}`,
                `POSTGRES_USER=root`,
                `POSTGRES_DB=${crypto.randomBytes(6).toString('hex')}`
            ]
            break;
        case 'mongo'
    }

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
                Env,
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