import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface DockerComposeDownConfig extends DockerComposeConfigBase {
}

export function dockerComposeDown(config: DockerComposeDownConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const command = getDockerComposeCommand({
    command: 'down',
    composeFiles: config.composeFiles,
    projectName: config.projectName
  });

  return executeCommand(command, options);
}
