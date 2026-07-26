import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const isTunnel = process.argv.includes('--tunnel');

console.log('\n===============================================================');
console.log('       🛡️  KSP RAKSHAK-AI - Intelligent Intelligence Engine       ');
console.log('   Karnataka State Police Datathon 2026 Multi-Agent Platform   ');
console.log('===============================================================\n');

// 1. Ensure database is seeded
const dbPath = path.join(backendDir, 'ksp_rakshak.db');
if (!fs.existsSync(dbPath)) {
  console.log('⚡ Initializing & Seeding KSP Crime Database (>10,000 entities)...');
  try {
    execSync('python3 seed.py', { cwd: backendDir, stdio: 'inherit' });
    console.log('✅ Database successfully initialized!\n');
  } catch (err) {
    console.error('❌ Failed to seed database:', err.message);
  }
} else {
  console.log('✅ KSP SQLite Database found at backend/ksp_rakshak.db');
}

// 2. Ensure frontend dependencies are installed
const viteBin = path.join(frontendDir, 'node_modules', '.bin', 'vite');
if (!fs.existsSync(viteBin)) {
  console.log('⚡ Checking/Installing frontend dependencies...');
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit', env: { ...process.env, NPM_CONFIG_CACHE: '/tmp/npm-cache' } });
  } catch (err) {
    console.log('ℹ️ Note on frontend install:', err.message);
  }
}

const children = [];

// 3. Start Backend Server (FastAPI)
console.log('🚀 Starting Backend Server (FastAPI on http://localhost:8000)...');
const backendProcess = spawn('python3', ['main.py'], {
  cwd: backendDir,
  stdio: 'inherit',
  env: { ...process.env, PYTHONUNBUFFERED: '1' }
});
children.push(backendProcess);

// 4. Start Frontend Server (Vite React)
console.log('🚀 Starting Frontend Dashboard (Vite React on http://localhost:3000)...');
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});
children.push(frontendProcess);

// 5. Start Tunnel if requested
if (isTunnel) {
  console.log('🌐 Starting Public Tunnel for Port 3000 (Localtunnel)...');
  setTimeout(() => {
    const tunnelProcess = spawn('npx', ['localtunnel', '--port', '3000'], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });
    children.push(tunnelProcess);
  }, 2000);
}

console.log('\n---------------------------------------------------------------');
console.log('  📍 FRONTEND DASHBOARD : http://localhost:3000');
console.log('  ⚙️  BACKEND API ENGINE : http://localhost:8000');
console.log('  📑 API DOCUMENTATION  : http://localhost:8000/docs');
if (isTunnel) {
  console.log('  🌐 TUNNEL SERVICE    : Localtunnel launching on http://localhost:3000');
} else {
  console.log('  💡 Run `npm run dev:tunnel` or `npm run tunnel` to expose live tunnel');
}
console.log('---------------------------------------------------------------\n');

// Clean cleanup on SIGINT/SIGTERM
function cleanup() {
  console.log('\n🛑 Shutting down KSP RAKSHAK-AI servers...');
  children.forEach(child => {
    if (child && !child.killed) {
      try { child.kill('SIGINT'); } catch (e) {}
    }
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
