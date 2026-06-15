import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import type { FixtureState } from './setup/types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = resolve(__dirname, 'report');

export interface AssertionResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  error?: string;
}

export interface IsolationReport {
  status: 'PASS' | 'FAIL';
  assertions_passed: number;
  assertions_failed: number;
  assertions_total: number;
  commit: string;
  timestamp: string;
  duration_ms: number;
  results: AssertionResult[];
}

function getCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return process.env.GIT_COMMIT ?? 'unknown';
  }
}

export async function generateReport(opts: {
  failCount: number;
  startedAt: number;
  results: AssertionResult[];
}): Promise<void> {
  const { failCount, startedAt, results } = opts;
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  const report: IsolationReport = {
    status: failCount === 0 ? 'PASS' : 'FAIL',
    assertions_passed: passed,
    assertions_failed: failed,
    assertions_total: results.length,
    commit: getCommit(),
    timestamp: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    results,
  };

  mkdirSync(REPORT_DIR, { recursive: true });

  const jsonPath = resolve(REPORT_DIR, 'isolation-report.json');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  const htmlPath = resolve(REPORT_DIR, 'isolation-report.html');
  writeFileSync(htmlPath, buildHtml(report), 'utf-8');

  console.log(`\n📊 Report written to:\n  JSON: ${jsonPath}\n  HTML: ${htmlPath}`);
}

function statusBadge(s: IsolationReport['status']) {
  return s === 'PASS'
    ? '<span style="background:#10b981;color:#fff;padding:4px 12px;border-radius:4px;font-weight:700">PASS</span>'
    : '<span style="background:#ef4444;color:#fff;padding:4px 12px;border-radius:4px;font-weight:700">FAIL</span>';
}

function rowStyle(status: string) {
  if (status === 'pass') return 'background:#f0fdf4';
  if (status === 'fail') return 'background:#fef2f2';
  return 'background:#f9fafb';
}

function buildHtml(r: IsolationReport): string {
  const byCategory: Record<string, AssertionResult[]> = {};
  for (const a of r.results) {
    (byCategory[a.category] ??= []).push(a);
  }

  const categoryBlocks = Object.entries(byCategory)
    .map(([cat, items]) => {
      const rows = items
        .map(
          (a) => `
      <tr style="${rowStyle(a.status)}">
        <td style="padding:6px 12px">${a.status === 'pass' ? '✅' : a.status === 'fail' ? '❌' : '⊘'}</td>
        <td style="padding:6px 12px;font-family:monospace;font-size:13px">${escHtml(a.name)}</td>
        <td style="padding:6px 12px;color:#6b7280;font-size:12px">${a.error ? escHtml(a.error) : ''}</td>
      </tr>`,
        )
        .join('');
      return `
    <h3 style="margin-top:24px;margin-bottom:6px;color:#374151">${escHtml(cat)}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr style="background:#f3f4f6">
        <th style="padding:6px 12px;text-align:left;width:36px"></th>
        <th style="padding:6px 12px;text-align:left">Assertion</th>
        <th style="padding:6px 12px;text-align:left">Error</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PrivyDesk — RLS Isolation Report</title>
  <style>body{font-family:system-ui,sans-serif;max-width:960px;margin:40px auto;padding:0 20px;color:#111}</style>
</head>
<body>
  <h1>PrivyDesk — Multi-Tenant RLS Isolation Report</h1>
  <table style="border-collapse:collapse;margin-bottom:24px">
    <tr><td style="padding:4px 16px 4px 0;font-weight:600">Status</td><td>${statusBadge(r.status)}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;font-weight:600">Assertions</td><td>${r.assertions_passed} passed / ${r.assertions_failed} failed / ${r.assertions_total} total</td></tr>
    <tr><td style="padding:4px 16px 4px 0;font-weight:600">Commit</td><td><code>${r.commit}</code></td></tr>
    <tr><td style="padding:4px 16px 4px 0;font-weight:600">Timestamp</td><td>${r.timestamp}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;font-weight:600">Duration</td><td>${(r.duration_ms / 1000).toFixed(1)}s</td></tr>
  </table>
  ${categoryBlocks}
</body>
</html>`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
