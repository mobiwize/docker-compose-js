import {
  dockerComposeDown, dockerComposeUp, dockerComposePS, getServiceAddress, waitUntilHealthy, getServiceId,
  DockerComposeDownConfig, DockerComposeUpConfig, DockerComposePSConfig, GetServiceAddressConfig, GetServiceIdConfig,
  CommandResult
} from './index';
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
        servicesToStart: [testingServiceName]
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
      getServiceAddressConfig = {
        composeFiles,
        cwd,
        environmentVariables,
        serviceName: testingServiceName,
        originalPort: 1234
      }
      getServiceIdConfig = {
        composeFiles,
        cwd,
        environmentVariables,
        serviceName: testingServiceName
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
      const serviceStatusIndex = stdout.indexOf('testresources_testing_service');
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
        serviceName: testingServiceName
      })

      expect(result).to.be.true;
    })

    describe('dockerComposeDown', () => {
      let downResult: CommandResult;

      beforeEach(async function () {
        this.timeout(0);
        downResult = await dockerComposeDown(upConfig);
      })

      it('should not fail', () => {
        expect(downResult.error).to.be.null;
      })

      it('should stop the containers', async function () {
        this.timeout(0);

        const psResult: CommandResult = await dockerComposePS(psConfig);

        expect(psResult.error).to.be.null;

        const stdout = <string>psResult.stdout;

        const serviceStatusIndex = stdout.indexOf('testresources_testing_service');

        expect(serviceStatusIndex).to.be.equal(-1);
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
          servicesToStart: [healthyServiceName]
        })
      })

      it('waitUntilHealthy should return true', async function () {
        this.timeout(0);
        const result = await waitUntilHealthy({
          cwd,
          composeFiles,
          environmentVariables,
          serviceName: healthyServiceName
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
          servicesToStart: [unhealthyServiceName]
        })
      })

      it('waitUntilHealthy should return false', async function () {
        this.timeout(0);
        const result = await waitUntilHealthy({
          cwd,
          composeFiles,
          environmentVariables,
          serviceName: unhealthyServiceName
        })

        expect(result).to.be.false;
      })
    })
  })
});
