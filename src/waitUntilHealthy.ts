import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { getServiceId } from './getServiceId';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";

export interface WaitUntilHealthyConfig extends DockerComposeConfigBase {
  serviceName: string;
  retries?: number;
  checkIntervalMilliseconds?: number,
}

export async function waitUntilHealthy(config: WaitUntilHealthyConfig): Promise<boolean> {
  console.log('waitUntilHealthy: Getting service id')
  const serviceId: string = await getServiceId({
    composeFiles: config.composeFiles,
    cwd: config.cwd,
    environmentVariables: config.environmentVariables,
    serviceName: config.serviceName,
    projectName: config.projectName
  });

  console.log(`waitUntilHealthy: Got service id: ${serviceId}`);

  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  let retries: number = config.retries || 10;
  const checkInterval: number = config.checkIntervalMilliseconds || 1000;
  const command = `docker ps --filter id=${serviceId} --format "{{.Status}}"`;


  let result: CommandResult;
  do {
    console.log(`waitUntilHealthy: Giving the container time to spin up. Sleeping for [${checkInterval}] milliseconds.`)
    await new Promise((resolve) => setTimeout(resolve, checkInterval));

    console.log(`waitUntilHealthy: Checking container state using the command [${command}]. Number of retries left: ${retries}. CheckIntervalMilliseconds: ${checkInterval}`);
    result = await executeCommand(command, options);
    console.log('waitUntilHealthy: Command result', result);

    if (result.error) {
      console.log('waitUntilHealthy: Failed checking the container status. Error:', result.stderr);
      throw result.error;
    }

    retries--;
    if (retries < 0) {
      console.log('waitUntilHealthy: No more retries left, reporting container as unhealthy')
      return false;
    }
  } while (!result.stdout || result.stdout.indexOf('starting') >= 0);

  if (result.stdout.indexOf('unhealthy') >= 0) {
    console.log('waitUntilHealthy: Container is reporting an unhealthy state')
    return false;
  }

  console.log('waitUntilHealthy: Container is up. Reporing container as healthy')

  return true;
}
