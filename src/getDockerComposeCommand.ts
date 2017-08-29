export interface GetDockerComposeCommandConfig {
  composeFiles: string[];
  projectName: string | undefined;
  command: string;
  commandArgs?: string[];
}

export function getDockerComposeCommand(config: GetDockerComposeCommandConfig): string {
  const composeFiles: string = config.composeFiles.map(file => `-f ${file}`).join(' ');
  const projectName = !config.projectName ? '' : `--project-name ${config.projectName}`;
  const commandArgs = !config.commandArgs ? '' : config.commandArgs.join(' ');

  return `docker-compose ${composeFiles} ${projectName} ${config.command} ${commandArgs}`;
}
