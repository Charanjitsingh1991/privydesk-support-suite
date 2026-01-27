/**
 * k6 Load Testing Script for PRIVYDESK
 * 
 * Run with: k6 run tests/performance/load-test.js
 * 
 * Installation: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const ticketListDuration = new Trend('ticket_list_duration');
const authDuration = new Trend('auth_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 100 },  // Stay at 100 users for 5 minutes
    { duration: '2m', target: 50 },   // Ramp down to 50
    { duration: '1m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],         // Error rate under 1%
    errors: ['rate<0.05'],                  // Custom error rate under 5%
    ticket_list_duration: ['p(95)<1000'],   // Ticket list under 1s
    auth_duration: ['p(95)<2000'],          // Auth under 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Simulated user data
const testUsers = [
  { email: 'agent1@test.com', password: 'TestPass123!' },
  { email: 'agent2@test.com', password: 'TestPass123!' },
  { email: 'admin@test.com', password: 'AdminPass123!' },
];

export function setup() {
  console.log('Starting load test against:', BASE_URL);
  return { startTime: new Date().toISOString() };
}

export default function () {
  group('Homepage Load', () => {
    const res = http.get(`${BASE_URL}/`);
    
    check(res, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage loads quickly': (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Auth Page Load', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/auth/login`);
    authDuration.add(Date.now() - startTime);
    
    check(res, {
      'login page status is 200': (r) => r.status === 200,
      'login page has form': (r) => r.body && r.body.includes('email'),
    });
    
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Static Assets', () => {
    const assets = [
      '/favicon.ico',
      '/manifest.json',
    ];
    
    const responses = http.batch(
      assets.map(asset => ['GET', `${BASE_URL}${asset}`])
    );
    
    responses.forEach((res, index) => {
      check(res, {
        [`asset ${assets[index]} loads`]: (r) => r.status === 200 || r.status === 304,
      });
    });
  });

  sleep(Math.random() * 3 + 1); // Random sleep 1-4 seconds
}

export function handleSummary(data) {
  return {
    'tests/performance/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const { metrics } = data;
  
  let summary = '\n========== LOAD TEST SUMMARY ==========\n\n';
  
  summary += `Total Requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  summary += `Failed Requests: ${metrics.http_req_failed?.values?.passes || 0}\n`;
  summary += `Avg Response Time: ${(metrics.http_req_duration?.values?.avg || 0).toFixed(2)}ms\n`;
  summary += `P95 Response Time: ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `P99 Response Time: ${(metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n`;
  summary += `Error Rate: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  
  summary += '\n========================================\n';
  
  return summary;
}
