const Dockerode = require('dockerode');

const docker = new Dockerode({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });

module.exports = async (Image) => { 
    for (let image of await docker.listImages()) {
        let dockerImage = new Dockerode.Image(docker.modem, image.Id);
        let inspectImage = await dockerImage.inspect();

        await Image.create({
            imageId: inspectImage.Id,
            imageRepoTags: inspectImage.RepoTags,
            imageRepoDigests: inspectImage.RepoDigests,
            imageParentId: inspectImage.Parent,
            imageCreated: inspectImage.Created,
            imageContainer: inspectImage.Container,
            imageExposedPort: inspectImage.ContainerConfig.ExposedPorts ? Object.keys(inspectImage.ContainerConfig.ExposedPorts)[0].split('/')[0] : 0,
            imageEnv: inspectImage.ContainerConfig.Env,
            imageCmd: inspectImage.ContainerConfig.Cmd,
            imageWorkDir: inspectImage.ContainerConfig.WorkingDir
        });
    };
};