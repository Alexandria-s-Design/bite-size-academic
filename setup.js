#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Bite Size Academic for local development...\n');

// Create necessary directories
const directories = [
  'node_modules',
  'apps/web/.next',
  'packages/core/dist',
  'storage/mock-emails',
  'storage/audio',
  'storage/feeds',
  'artifacts'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create environment file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  fs.copyFileSync(path.join(__dirname, '.env.example'), envPath);
  console.log('✅ Created .env file');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
const { spawn } = require('child_process');

const installProcess = spawn('npm', ['install'], {
  stdio: 'inherit',
  cwd: __dirname
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Dependencies installed successfully!');
    console.log('\n🎉 Setup complete! You can now run the application:');
    console.log('\n   npm run dev    # Start development server');
    console.log('   npm run build  # Build for production');
    console.log('   npm test      # Run tests');
    console.log('\n🌐 Visit: http://localhost:3000');
  } else {
    console.error('\n❌ Failed to install dependencies');
    process.exit(1);
  }
});