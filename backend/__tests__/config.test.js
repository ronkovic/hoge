import { describe, it, expect } from '@jest/globals';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const backendDir = join(__dirname, '..');

describe('Backend Project Configuration', () => {
  describe('tsconfig.json', () => {
    const tsconfigPath = join(backendDir, 'tsconfig.json');

    it('should exist in the backend directory', () => {
      expect(existsSync(tsconfigPath)).toBe(true);
    });

    it('should have valid JSON structure', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have required compiler options', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('compilerOptions');
      expect(config.compilerOptions).toHaveProperty('target');
      expect(config.compilerOptions).toHaveProperty('module');
      expect(config.compilerOptions).toHaveProperty('outDir');
      expect(config.compilerOptions).toHaveProperty('rootDir');
      expect(config.compilerOptions).toHaveProperty('strict');
    });

    it('should target ES2020 or later', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      const validTargets = ['ES2020', 'ES2021', 'ES2022', 'ESNext'];
      expect(validTargets).toContain(config.compilerOptions.target);
    });

    it('should use NodeNext or ES2020+ module system', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      const validModules = ['NodeNext', 'ES2020', 'ES2022', 'ESNext'];
      expect(validModules).toContain(config.compilerOptions.module);
    });

    it('should enable strict mode', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.compilerOptions.strict).toBe(true);
    });

    it('should have include patterns', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('include');
      expect(Array.isArray(config.include)).toBe(true);
      expect(config.include.length).toBeGreaterThan(0);
    });

    it('should exclude node_modules and dist directories', () => {
      const content = readFileSync(tsconfigPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('exclude');
      expect(Array.isArray(config.exclude)).toBe(true);
      expect(config.exclude).toContain('node_modules');
      expect(config.exclude.some(pattern => pattern.includes('dist'))).toBe(true);
    });
  });

  describe('ESLint Configuration', () => {
    const eslintConfigPath = join(backendDir, 'eslint.config.js');
    const legacyEslintPath = join(backendDir, '.eslintrc.js');

    it('should have ESLint configuration file', () => {
      const hasModernConfig = existsSync(eslintConfigPath);
      const hasLegacyConfig = existsSync(legacyEslintPath);

      expect(hasModernConfig || hasLegacyConfig).toBe(true);
    });

    it('should be a valid JavaScript module', () => {
      if (existsSync(eslintConfigPath)) {
        const content = readFileSync(eslintConfigPath, 'utf-8');
        expect(content).toContain('export default');
      }
    });

    it('should configure TypeScript parser', () => {
      if (existsSync(eslintConfigPath)) {
        const content = readFileSync(eslintConfigPath, 'utf-8');
        expect(
          content.includes('@typescript-eslint/parser') ||
          content.includes('typescript-eslint')
        ).toBe(true);
      }
    });
  });

  describe('Prettier Configuration', () => {
    const prettierConfigPaths = [
      join(backendDir, '.prettierrc'),
      join(backendDir, '.prettierrc.json'),
      join(backendDir, '.prettierrc.js'),
      join(backendDir, 'prettier.config.js'),
    ];

    it('should have Prettier configuration file', () => {
      const hasPrettierConfig = prettierConfigPaths.some(path => existsSync(path));
      expect(hasPrettierConfig).toBe(true);
    });

    it('should have valid JSON or JS configuration', () => {
      const existingConfig = prettierConfigPaths.find(path => existsSync(path));

      if (existingConfig) {
        const content = readFileSync(existingConfig, 'utf-8');

        if (existingConfig.endsWith('.json') || existingConfig === join(backendDir, '.prettierrc')) {
          expect(() => JSON.parse(content)).not.toThrow();
        } else {
          // JS configuration should contain export
          expect(
            content.includes('export default') ||
            content.includes('module.exports')
          ).toBe(true);
        }
      }
    });

    it('should configure print width and tab width', () => {
      const existingConfig = prettierConfigPaths.find(path => existsSync(path));

      if (existingConfig) {
        const content = readFileSync(existingConfig, 'utf-8');

        expect(
          content.includes('printWidth') ||
          content.includes('print-width')
        ).toBe(true);

        expect(
          content.includes('tabWidth') ||
          content.includes('tab-width')
        ).toBe(true);
      }
    });
  });

  describe('package.json TypeScript Dependencies', () => {
    const packageJsonPath = join(backendDir, 'package.json');

    it('should exist', () => {
      expect(existsSync(packageJsonPath)).toBe(true);
    });

    it('should have TypeScript as devDependency', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.devDependencies).toHaveProperty('typescript');
    });

    it('should have @types/node as devDependency', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.devDependencies).toHaveProperty('@types/node');
    });

    it('should have @types/express as devDependency', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.devDependencies).toHaveProperty('@types/express');
    });

    it('should have ESLint TypeScript plugins', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(
        pkg.devDependencies['@typescript-eslint/parser'] ||
        pkg.devDependencies['@typescript-eslint/eslint-plugin']
      ).toBeDefined();
    });

    it('should have Prettier as devDependency', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.devDependencies).toHaveProperty('prettier');
    });

    it('should have TypeScript build script', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.scripts).toHaveProperty('build');
      expect(pkg.scripts.build).toContain('tsc');
    });

    it('should have type-check script', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(
        pkg.scripts['type-check'] ||
        pkg.scripts['typecheck'] ||
        pkg.scripts.build
      ).toBeDefined();
    });

    it('should have lint script', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.scripts).toHaveProperty('lint');
      expect(pkg.scripts.lint).toContain('eslint');
    });

    it('should have format script', () => {
      const content = readFileSync(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      expect(pkg.scripts).toHaveProperty('format');
      expect(pkg.scripts.format).toContain('prettier');
    });
  });

  describe('Directory Structure', () => {
    it('should have src directory for TypeScript source files', () => {
      const srcPath = join(backendDir, 'src');
      expect(existsSync(srcPath)).toBe(true);
    });

    it('should have dist directory in .gitignore', () => {
      const gitignorePath = join(backendDir, '.gitignore');

      if (existsSync(gitignorePath)) {
        const content = readFileSync(gitignorePath, 'utf-8');
        expect(content).toContain('dist');
      }
    });
  });
});
