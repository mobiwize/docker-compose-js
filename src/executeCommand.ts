import { exec, ExecOptions } from 'child_process';

export interface CommandResult {
  error: Error | null;
  stdout: string | null;
  stderr: string | null;
}

export function executeCommand(command: string, options: ExecOptions): Promise<CommandResult> {
  return new Promise<CommandResult>((resolve, reject) => {
    exec(command, options, (error: Error, stdout: string, stderr: string) => {
      const result: CommandResult = {
        error,
        stdout,
        stderr
      }

      if (error) {
        console.log(result);
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
}
