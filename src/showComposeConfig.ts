import { ExecOptions } from 'child_process';
import { executeCommand, CommandResult } from './executeCommand';
import { DockerComposeConfigBase } from "./dockerComposeConfigBase";
import { getDockerComposeCommand } from "./getDockerComposeCommand";

export async function showComposeConfig(config: DockerComposeConfigBase): Promise<void> {
  const options: ExecOptions = {
    env: config.environmentVariables,
    cwd: config.cwd
  };

  const command = getDockerComposeCommand({
    command: 'config',
    composeFiles: config.composeFiles,
    projectName: config.projectName
  });

  const result: CommandResult = await executeCommand(command, options);

  console.log('===============================')
  console.log('docker-compose configuration: ')
  console.log(result.stdout);
  console.log('===============================')
}
