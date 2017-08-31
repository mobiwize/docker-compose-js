import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";
import { showComposeConfig } from './showComposeConfig';

export interface DockerComposeUpConfig extends DockerComposeConfigBase {
  servicesToStart?: string[];
  build?: boolean;
  showConfig?: boolean;
}

export async function dockerComposeUp(config: DockerComposeUpConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  if (config.showConfig) {
    await showComposeConfig(config);
  }
    
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
