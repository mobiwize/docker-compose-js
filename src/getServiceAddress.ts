import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface GetServiceAddressConfig extends DockerComposeConfigBase {
  serviceName: string;
  originalPort: number;
}

export async function getServiceAddress(config: GetServiceAddressConfig): Promise<string> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const command = getDockerComposeCommand({
    command: 'port',
    commandArgs: [config.serviceName, config.originalPort.toString()],
    composeFiles: config.composeFiles,
    projectName: config.projectName
  });

  const result: CommandResult = await executeCommand(command, options);
  if (result.error) {
    console.log(result.stderr);
    throw result.error;
  }

  if (!result.stdout) {
    console.log(result.stderr);
    throw new Error('Failed getting the address for the service');
  }

  return result.stdout.replace('\r', '').replace('\n', '');
}
