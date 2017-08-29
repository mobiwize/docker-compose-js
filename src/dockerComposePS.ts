import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface DockerComposePSConfig extends DockerComposeConfigBase {
}

export function dockerComposePS(config: DockerComposePSConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const command = getDockerComposeCommand({
    command: 'ps',
    composeFiles: config.composeFiles,
    projectName: config.projectName
  });

  return executeCommand(command, options);
}
