import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';

export interface DockerComposePSConfig {
  cwd?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };
}

export function dockerComposePS(config: DockerComposePSConfig): Promise<CommandResult> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };
    
  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');
  
  const command = `docker-compose ${composeFiles} ps`;

  return executeCommand(command, options);
}
