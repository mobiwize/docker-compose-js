import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';

export interface DockerComposeUpConfig {
  cwd?: string;
  servicesToStart?: string[];
  build?: boolean;
  projectName?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };
}

export function dockerComposeUp(config: DockerComposeUpConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const projectName = config.projectName ? `-p ${config.projectName}` : '';
  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');
  const build = config.build ? '--build' : '';
  const servicesToStart = (config.servicesToStart || []).join(' ');
  
  const command = `docker-compose ${projectName} ${composeFiles} up -d ${build} ${servicesToStart}`;

  return executeCommand(command, options);
}
