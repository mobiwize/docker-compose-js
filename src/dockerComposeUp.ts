import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export interface DockerComposeUpConfig extends DockerComposeConfigBase {
  servicesToStart?: string[];
  build?: boolean;
}

export function dockerComposeUp(config: DockerComposeUpConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const build = config.build ? '--build' : '';
  const servicesToStart = (config.servicesToStart || []).join(' ');
  
  const command = getDockerComposeCommand({
    command: 'up',
    commandArgs: ['-d', build, servicesToStart],
    composeFiles: config.composeFiles,
    projectName: config.projectName
  });

  return executeCommand(command, options);
}
