export interface DockerComposeConfigBase {
  cwd?: string;
  composeFiles: string[];
  environmentVariables?: { [key: string]: string };
  projectName?: string;
}
