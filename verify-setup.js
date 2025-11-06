#!/usr/bin/env node

import { existsSync } from 'fs';
import { resolve } from 'path';

const checks = {
  '✅': '\x1b[32m✅\x1b[0m',
  '❌': '\x1b[31m❌\x1b[0m',
  '📦': '\x1b[34m📦\x1b[0m',
};

console.log('\n' + '='.repeat(60));
console.log('🔍 Verifying Agent-to-Agent Infrastructure Setup');
console.log('='.repeat(60) + '\n');

let allGood = true;

// Check if packages are built
const packagesToCheck = [
  { name: 'SDK', path: 'packages/sdk/dist/index.js' },
  { name: 'Registry', path: 'packages/registry/dist/index.js' },
  { name: 'Router', path: 'packages/router/dist/index.js' },
];

console.log('📦 Checking Built Packages:\n');

packagesToCheck.forEach(pkg => {
  const exists = existsSync(resolve(pkg.path));
  console.log(`  ${exists ? checks['✅'] : checks['❌']} ${pkg.name} ${exists ? '(built)' : '(NOT BUILT)'}`);
  if (!exists) allGood = false;
});

// Check if demo files exist
console.log('\n🎬 Checking Demo Files:\n');

const demoFiles = [
  { name: 'Translator Agent', path: 'demo/agents/translator-agent.ts' },
  { name: 'Summarizer Agent', path: 'demo/agents/summarizer-agent.ts' },
  { name: 'Analyzer Agent', path: 'demo/agents/analyzer-agent.ts' },
  { name: 'Chain Demo', path: 'demo/chain-demo.js' },
  { name: 'Run Demo', path: 'demo/run-demo.js' },
];

demoFiles.forEach(file => {
  const exists = existsSync(resolve(file.path));
  console.log(`  ${exists ? checks['✅'] : checks['❌']} ${file.name}`);
  if (!exists) allGood = false;
});

// Check documentation
console.log('\n📚 Checking Documentation:\n');

const docs = [
  { name: 'README', path: 'README.md' },
  { name: 'SETUP', path: 'SETUP.md' },
  { name: 'Getting Started', path: 'docs/GETTING_STARTED.md' },
  { name: 'API Docs', path: 'docs/API.md' },
  { name: 'Hackathon Checklist', path: 'docs/HACKATHON_CHECKLIST.md' },
];

docs.forEach(doc => {
  const exists = existsSync(resolve(doc.path));
  console.log(`  ${exists ? checks['✅'] : checks['❌']} ${doc.name}`);
  if (!exists) allGood = false;
});

console.log('\n' + '='.repeat(60));

if (allGood) {
  console.log('\n🎉 All checks passed! You\'re ready to run the demo!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run demo:chain');
  console.log('  2. Watch the agents interact in real-time');
  console.log('  3. Check out docs/GETTING_STARTED.md for more\n');
} else {
  console.log('\n⚠️  Some checks failed. Try running:\n');
  console.log('  npm install');
  console.log('  npm run build\n');
}

console.log('='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);

