import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { getServiceId } from './getServiceId';

export interface WaitUntilHealthyConfig {
  serviceName: string;
  composeFiles: string[];
  retries?: number;
  checkIntervalMilliseconds?: number,
  cwd?: string;
  environmentVariables?: { [key: string]: string };
}

export async function waitUntilHealthy(config: WaitUntilHealthyConfig): Promise<boolean> {
  const serviceId: string = await getServiceId({
    composeFiles: config.composeFiles,
    cwd: config.cwd,
    environmentVariables: config.environmentVariables,
    serviceName: config.serviceName
  });

  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  let retries: number = config.retries || 10;
  const checkInterval: number = config.checkIntervalMilliseconds || 1000;
  const command = `docker ps --filter id=${serviceId} --format "{{.Status}}"`;

  let result: CommandResult;
  do {
    result = await executeCommand(command, options);
    if (result.error) {
      console.log(result.stderr);
      throw result.error;
    }

    retries--;
    if (retries < 0) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  } while (!result.stdout || result.stdout.indexOf('starting') >= 0);

  if (result.stdout.indexOf('unhealthy') >= 0) {
    return false;
  }

  return true;
}
