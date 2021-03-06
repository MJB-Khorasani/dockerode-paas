const path = require('path');
const { promises: fsPromises } = require('fs');

const Dockerode = require('dockerode');
const extractZip = require('extract-zip');
const { IncomingForm } = require('formidable');

const Image = require('../models/image');

const docker = new Dockerode({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });

const DOCKER_PATH = path.join(__dirname, '..', '..', 'docker');

module.exports.uploadZip = async (req, res, next) => {
    const newImage = await Image.create({});
    let form = new IncomingForm();

    form.parse(req);
    form.on('fileBegin', async (name, file) => {
        let extractDir = path.join(DOCKER_PATH, newImage.id);

        await fsPromises.mkdir(extractDir);
        await extractZip(file.path, { dir: extractDir });
    });
    form.on('error', next);
    form.on('end', () => {
        req.apiError = null;
        req.apiData = newImage.id;
        req.apiStatus = 200;
        next();
    });
};

module.exports.build = async (req, res, next) => {
    let { baseImageId, newImageId } = req.body;
    let newImage = await Image.findByPk(newImageId);
    let baseImage = await Image.findByPk(baseImageId);
    let imageContext = path.join(DOCKER_PATH, newImageId);
    let dockerfile = await fsPromises.readFile(path.join(DOCKER_PATH, 'Dockerfile'), 'utf8');

    dockerfile = dockerfile.replace(/REPO_TAG/, baseImage.imageRepoTags[0]);
    dockerfile = dockerfile.replace(/IMAGE_WORK_DIR/, baseImage.imageWorkDir);
    dockerfile = dockerfile.replace(/EXPOSE_PORT/, baseImage.imageExposedPort);
    if (baseImage.imageRepoTags[0].split(':')[0] === 'node') {

        dockerfile = dockerfile.replace(/#RUN_COMMAND/, 'RUN npm i && npm build');
        dockerfile = dockerfile.replace(/#CMD_COMMAND/, 'CMD ["npm", "start"]');
    };

    await fsPromises.writeFile(path.join(imageContext, 'Dockerfile'), dockerfile, 'utf8');
    // await tar.create({ file: 'Dockerfile.tar' }, [tarDockerfile]);

    let buildProgress = await docker.buildImage({
        context: imageContext,
        src: ['Dockerfile']
    }, {
        t: `${baseImage.imageRepoTags[0].split(':')[0]}:${Date.now()}`
    });

    let dockerImageId = await new Promise((resolve, reject) => {
        docker.modem.followProgress(buildProgress, (error, result) => error ? reject(error) : resolve(result));
    });

    let image = new Dockerode.Image(docker.modem, dockerImageId);
    let inspectImage = await image.inspect();

    newImage.imageId = inspectImage.Id;
    newImage.imageRepoTags = inspectImage.RepoTags;
    newImage.imageRepoDigests = inspectImage.RepoDigests;
    newImage.imageParentId = inspectImage.Parent;
    newImage.imageCreated = inspectImage.Created;
    newImage.imageContainer = inspectImage.Container;
    newImage.imageExposedPort = inspectImage.ContainerConfig.ExposedPorts;
    newImage.imageEnv = inspectImage.ContainerConfig.Env;
    newImage.imageCmd = inspectImage.ContainerConfig.Cmd;
    newImage.imageWorkDir = inspectImage.ContainerConfig.WorkingDir;
    newImage.ImageId = baseImageId;
    await newImage.save();

    req.apiData = newImageId;
    req.apiError = null;
    req.apiStatus = 200;
    next();
};

module.exports.list = async (req, res, next) => {
    let images = await Image.findAndCountAll();

    req.apiError = null;
    req.apiData = {
        list: images.rows,
        paging: {
            totalCount: images.count,
            currentPage: 0,
            pageSize: 0,
            start: 0,
            end: 0
        }
    };
    req.apiStatus = 200;
    next();
};

module.exports.add = async (req, res, next) => { 
    let { id } = req.body;
    let image = new Dockerode.Image(docker.modem, id);
    let imageInspect = await image.inspect();
    let insertedImage = await Image.create({
        imageId: imageInspect.Id,
        imageRepoTags: imageInspect.RepoTags,
        imageRepoDigests: imageInspect.RepoDigests,
        imageParentId: imageInspect.Parent,
        imageCreated: imageInspect.Created,
        imageContainer: imageInspect.Container,
        imageExposedPort: imageInspect.ContainerConfig.ExposedPorts,
        imageEnv: imageInspect.ContainerConfig.Env,
        imageCmd: imageInspect.ContainerConfig.Cmd,
        imageWorkDir: imageInspect.ContainerConfig.WorkingDir,
    });

    req.apiData = insertedImage.id
    req.apiError = null;
    req.apiStatus = 200;
    next();
};