import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const result: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      result[key] = val;
    }
    return result;
  } catch {
    return {};
  }
}

const envVars = loadEnvFile(resolve(__dirname, '.env.test.local'));

export default defineConfig({
  test: {
    name: 'isolation',
    environment: 'node',
    globals: true,
    include: ['tests/isolation/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 120_000,
    bail: 0,
    env: envVars,
    reporters: ['verbose'],
    outputFile: {
      json: 'tests/isolation/report/vitest-raw.json',
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
