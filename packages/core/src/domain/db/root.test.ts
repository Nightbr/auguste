import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import { findProjectRoot } from './root.js';

describe('findProjectRoot', () => {
  it('should find the project root with pnpm-workspace.yaml', () => {
    const existsSyncFn = vi.fn((p: string) => {
      if (p === path.join('/workspace', 'pnpm-workspace.yaml')) return true;
      return false;
    });

    const root = findProjectRoot('/workspace/packages/core', existsSyncFn);
    expect(root).toBe('/workspace');
    expect(existsSyncFn).toHaveBeenCalled();
  });

  it('should find the project root with turbo.json', () => {
    const existsSyncFn = vi.fn((p: string) => {
      if (p === path.join('/my-project', 'turbo.json')) return true;
      return false;
    });

    const root = findProjectRoot('/my-project/apps/web/src', existsSyncFn);
    expect(root).toBe('/my-project');
  });

  it('should find the project root with .git', () => {
    const existsSyncFn = vi.fn((p: string) => {
      if (p === path.join('/git-repo', '.git')) return true;
      return false;
    });

    const root = findProjectRoot('/git-repo/some/deep/path', existsSyncFn);
    expect(root).toBe('/git-repo');
  });

  it('should fallback to top-most package.json if no workspace markers found', () => {
    const existsSyncFn = vi.fn((p: string) => {
      if (p === path.join('/simple-project', 'package.json')) return true;
      if (p === path.join('/simple-project/pkg', 'package.json')) return true;
      return false;
    });

    const root = findProjectRoot('/simple-project/pkg', existsSyncFn);
    expect(root).toBe('/simple-project');
  });

  it('should return starting directory if only one package.json found and no workspace markers', () => {
    const existsSyncFn = vi.fn((p: string) => {
      if (p === path.join('/alone', 'package.json')) return true;
      return false;
    });

    const root = findProjectRoot('/alone', existsSyncFn);
    expect(root).toBe('/alone');
  });
});
