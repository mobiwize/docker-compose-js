import {
  dockerComposeDown, dockerComposeUp, dockerComposePS, getServiceAddress, waitUntilHealthy, getServiceId,
  DockerComposeDownConfig, DockerComposeUpConfig, DockerComposePSConfig, GetServiceAddressConfig, GetServiceIdConfig,
  CommandResult
} from './index';
import { executeCommand } from './executeCommand';
import { expect } from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as path from 'path';

chai.use(chaiAsPromised);

describe('docker-compose-js', () => {
  const composeFiles = [path.join('testResources', 'docker-compose.yml')];
  const cwd = path.join(__dirname, '..');
  const environmentVariables = {
    IMAGE_NAME: "testing_docker_compose_js",
    IMAGE_TAG: "testing"
  };
  const testingServiceName = 'testing_service';
  const projectName = 'dockerComposeJSProjectNameOverride'.toLowerCase();

  describe('dockerComposeUp', () => {
    let upConfig: DockerComposeUpConfig;
    let psConfig: DockerComposePSConfig;
    let downConfig: DockerComposeDownConfig;
    let getServiceAddressConfig: GetServiceAddressConfig;
    let getServiceIdConfig: GetServiceIdConfig;

    before(() => {
      upConfig = {
        cwd,
        composeFiles,
        build: true,
        environmentVariables,
        servicesToStart: [testingServiceName],
        projectName: projectName
      }
      psConfig = {
        cwd,
        composeFiles,
        environmentVariables,
        projectName: projectName
      }
      downConfig = {
        cwd,
        composeFiles,
        environmentVariables,
        projectName: projectName
      }
      getServiceAddressConfig = {
        composeFiles,
        cwd,
        environmentVariables,
        serviceName: testingServiceName,
        originalPort: 1234,
        projectName: projectName
      }
      getServiceIdConfig = {
        composeFiles,
        cwd,
        environmentVariables,
        serviceName: testingServiceName,
        projectName: projectName
      }
    })

    let upResult: CommandResult;

    beforeEach(async function () {
      this.timeout(0);
      await dockerComposeDown(downConfig);
      upResult = await dockerComposeUp(upConfig);
    })

    afterEach(async function () {
      this.timeout(0);
      await dockerComposeDown(downConfig);
    });

    it('should not fail', function () {
      expect(upResult.error).to.be.null;
    })

    it('should start the container correctly', async function () {
      this.timeout(0);

      const psResult: CommandResult = await dockerComposePS(psConfig);

      expect(psResult.error).to.be.null;

      const stdout = <string>psResult.stdout;
      const serviceStatusIndex = stdout.indexOf(`${projectName}_testing_service`);
      const endServiceStatus = stdout.indexOf('\n', serviceStatusIndex);
      const serticeStatus = stdout.substr(serviceStatusIndex, endServiceStatus - serviceStatusIndex);

      expect(serticeStatus).to.contain('sleep infinity   Up');
    })

    it('should return id', async function () {
      this.timeout(0);

      const id: string = await getServiceId(getServiceIdConfig);

      expect(id.length).to.be.least(6);
    })

    it('should expose port', async function () {
      this.timeout(0);

      const result: string = await getServiceAddress(getServiceAddressConfig);

      const expectedFormat: RegExp = /^\d+\.\d+\.\d+\.\d+\:\d+$/;
      expect(expectedFormat.test(result), `expected '${result}' to be of format ${expectedFormat}`).to.be.true;
    })

    it('should be healthy', async function () {
      this.timeout(0);
      const result = await waitUntilHealthy({
        cwd,
        composeFiles,
        environmentVariables,
        serviceName: testingServiceName,
        projectName: projectName
      })

      expect(result).to.be.true;
    })

    it('should set name correctly', async function () {
      this.timeout(0);

      const id: string = await getServiceId(getServiceIdConfig);

      const command = `docker ps --filter id=${id} --format "{{.Names}}"`;
      const result: CommandResult = await executeCommand(command, {});

      expect(result.error).to.be.null;
      expect(result.error).to.be.null;

      const nameRegExp: RegExp = new RegExp(`^${projectName}_${testingServiceName}_\\d+$`)
      const stdout = (<string>result.stdout).replace('\n', '').replace('\r', '');
      expect(nameRegExp.test(stdout), `expected '${stdout}' to match regex ${nameRegExp}`).to.be.true;
    })

    describe('dockerComposeDown', () => {
      let downResult: CommandResult;

      beforeEach(async function () {
        this.timeout(0);
        downResult = await dockerComposeDown(downConfig);
      })

      it('should not fail', () => {
        expect(downResult.error).to.be.null;
      })

      it('should stop the containers', async function () {
        this.timeout(0);

        const psResult: CommandResult = await dockerComposePS(psConfig);

        expect(psResult.error).to.be.null;

        const stdout = <string>psResult.stdout;

        const serviceStatusIndex = stdout.indexOf(testingServiceName);

        expect(serviceStatusIndex, 'the container was not stopped').to.be.equal(-1);
      })
    })

    describe('start healthy', () => {
      const healthyServiceName = 'testing_service_healthy';

      beforeEach(async function () {
        this.timeout(0);
        await dockerComposeUp({
          cwd,
          composeFiles,
          build: true,
          environmentVariables,
          servicesToStart: [healthyServiceName],
          projectName: projectName
        })
      })

      it('waitUntilHealthy should return true', async function () {
        this.timeout(0);
        const result = await waitUntilHealthy({
          cwd,
          composeFiles,
          environmentVariables,
          serviceName: healthyServiceName,
          projectName: projectName
        })

        expect(result).to.be.true;
      })
    })

    describe('start unhealthy', () => {
      const unhealthyServiceName = 'testing_service_unhealthy';

      beforeEach(async function () {
        this.timeout(0);
        return dockerComposeUp({
          cwd,
          composeFiles,
          build: true,
          environmentVariables,
          servicesToStart: [unhealthyServiceName],
          projectName: projectName
        })
      })

      it('waitUntilHealthy should return false', async function () {
        this.timeout(0);
        const result = await waitUntilHealthy({
          cwd,
          composeFiles,
          environmentVariables,
          serviceName: unhealthyServiceName,
          projectName: projectName
        })

        expect(result).to.be.false;
      })
    })
  })
});
