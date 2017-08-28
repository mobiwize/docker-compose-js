import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';

export interface GetServiceAddressConfig {
  serviceName: string;
  originalPort: number;
  cwd?: string;
  projectName?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };
}

export async function getServiceAddress(config: GetServiceAddressConfig): Promise<string> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const projectName = config.projectName ? `-p ${config.projectName}` : '';
  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');

  const command = `docker-compose ${projectName} ${composeFiles} port ${config.serviceName} ${config.originalPort}`;

  const result: CommandResult = await executeCommand(command, options);
  if (result.error) {
    console.log(result.stderr);
    throw result.error;
  }

  if (!result.stdout) {
    console.log(result.stderr);
    throw new Error('Failed getting the adress for the service');
  }

  return result.stdout.replace('\r', '').replace('\n', '');
}
