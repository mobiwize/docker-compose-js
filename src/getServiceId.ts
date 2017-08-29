import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface GetServiceIdConfig extends DockerComposeConfigBase {
  serviceName: string;
}

export async function getServiceId(config: GetServiceIdConfig): Promise<string> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const command = getDockerComposeCommand({
    command: 'ps',
    commandArgs: ['-q', config.serviceName],
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
    throw new Error('Failed getting the id for the service');
  }

  return result.stdout.replace('\r', '').replace('\n', '');
}
