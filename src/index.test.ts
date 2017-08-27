import {
  dockerComposeDown, dockerComposeUp, dockerComposePS,
  DockerComposeDownConfig, DockerComposeUpConfig, DockerComposePSConfig,
  CommandResult
} from './index';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';

chai.use(chaiAsPromised);

describe('docker-compose-js', () => {
  let upConfig: DockerComposeUpConfig;
  let psConfig: DockerComposePSConfig;
  let downConfig: DockerComposeDownConfig;

  before(() => {
    const composeFiles = [path.join('testResources', 'docker-compose.yml')];
    const cwd = path.join(__dirname, '..');
    const environmentVariables = {
      IMAGE_NAME: "testing_docker_compose_up",
      IMAGE_TAG: "testing"
    };

    upConfig = {
      cwd,
      composeFiles,
      build: true,
      environmentVariables
    }
    psConfig = {
      cwd,
      composeFiles,
      environmentVariables
    }
    downConfig = {
      cwd,
      composeFiles,
      environmentVariables
    }
  })

  describe('dockerComposeUp', () => {
    let upResult: CommandResult;

    beforeEach(async function () {
      this.timeout(0);
      upResult = await dockerComposeUp(upConfig);
    })

    it('should not fail', function () {
      console.log('error:\n', upResult.error);
      console.log('stdout:\n', upResult.stdout);
      console.log('stderr:\n', upResult.stderr);
      expect(upResult.error).to.be.null;
    })

    it('should start the container correctly', async function () {
      this.timeout(0);

      const psResult: CommandResult = await dockerComposePS(psConfig);

      expect(psResult.error).to.be.null;

      const stdout = <string>psResult.stdout;
      console.log(stdout);

      const serviceStatusIndex = stdout.indexOf('testresources_testing_service');
      const endServiceStatus = stdout.indexOf('\n', serviceStatusIndex);
      const serticeStatus = stdout.substr(serviceStatusIndex, endServiceStatus - serviceStatusIndex);

      expect(serticeStatus).to.contain('sleep infinity   Up');
    })

    describe('dockerComposeDown', () => {
      let downResult: CommandResult;

      beforeEach(async function () {
        this.timeout(0);
        downResult = await dockerComposeDown(upConfig);
      })

      it('should not fail', () => {
        console.log('error:\n', downResult.error);
        console.log('stdout:\n', downResult.stdout);
        console.log('stderr:\n', downResult.stderr);
        expect(downResult.error).to.be.null;
      })

      it('should stop the containers', async function () {
        this.timeout(0);

        const psResult: CommandResult = await dockerComposePS(psConfig);

        expect(psResult.error).to.be.null;

        const stdout = <string>psResult.stdout;
        console.log(stdout);

        const serviceStatusIndex = stdout.indexOf('testresources_testing_service');

        expect(serviceStatusIndex).to.be.equal(-1);
      })
    })
  })

});
