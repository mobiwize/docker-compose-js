import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';

export interface DockerComposeDownConfig {
  cwd?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };  
}

export function dockerComposeDown(config: DockerComposeDownConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');
  
  const command = `docker-compose ${composeFiles} down`;

  return executeCommand(command, options);
}
