import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';

export interface GetServiceIdConfig {
  serviceName: string;
  cwd?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };
}

export async function getServiceId(config: GetServiceIdConfig): Promise<string> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');

  const command = `docker-compose ${composeFiles} ps -q ${config.serviceName}`;

  const result: CommandResult = await executeCommand(command, options);
  if (result.error) {
    console.log(result.stderr);
    throw result.error;
  }

  if (!result.stdout) {
    console.log(result.stderr);
    throw new Error('Failed getting the id for the service');
  }

  return result.stdout.replace('\r', '').replace('\n', '');
}
