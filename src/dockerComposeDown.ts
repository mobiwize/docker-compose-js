import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface DockerComposeDownConfig extends DockerComposeConfigBase {
  removeImages?: boolean;
}

export function dockerComposeDown(config: DockerComposeDownConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const commandArgs = [];
  if (config.removeImages) {
    commandArgs.push('--rmi all');
  }
    
  const command = getDockerComposeCommand({
    command: 'down',
    composeFiles: config.composeFiles,
    projectName: config.projectName,
    commandArgs: commandArgs
  });

  return executeCommand(command, options);
}
