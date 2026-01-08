import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Find the project root by looking for workspace markers or git root
 * This works regardless of where the code is bundled/executed from
 */
export function findProjectRoot(startDir?: string, existsSyncFn = fs.existsSync): string {
  const __filename = fileURLToPath(import.meta.url);
  let currentDir = startDir || path.dirname(__filename);

  // Walk up the directory tree until we find the workspace root
  while (currentDir !== path.dirname(currentDir)) {
    // Look for workspace markers or git directory
    const rootMarkers = ['pnpm-workspace.yaml', 'turbo.json', '.git'];
    const isRoot = rootMarkers.some((marker) => existsSyncFn(path.join(currentDir, marker)));

    if (isRoot) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback: look for the most top-level package.json excluding common ignored dirs
  currentDir = startDir || path.dirname(__filename);
  let lastFoundPackageDir = currentDir;
  while (currentDir !== path.dirname(currentDir)) {
    if (
      existsSyncFn(path.join(currentDir, 'package.json')) &&
      !currentDir.includes('node_modules')
    ) {
      lastFoundPackageDir = currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return lastFoundPackageDir;
}
