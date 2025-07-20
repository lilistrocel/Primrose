const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { DockerManager } = require('./docker-services');

const LOGS_DIR = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

class ServiceManager {
  constructor() {
    this.services = new Map();
    this.setupCleanup();
  }

  setupCleanup() {
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down services...'));
      this.stopAllServices();
    });

    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n🛑 Terminating services...'));
      this.stopAllServices();
    });
  }

  async stopAllServicesWithDocker() {
    this.stopAllServices();
    
    // Also stop Docker services if they were started
    if (process.env.DOCKER_MONGODB === 'true') {
      const { DockerManager } = require('./docker-services');
      const dockerManager = new DockerManager();
      await dockerManager.stopServices();
    }
  }

  createLogStream(serviceName) {
    const logFile = path.join(LOGS_DIR, `${serviceName}.log`);
    return fs.createWriteStream(logFile, { flags: 'a' });
  }

  startService(name, command, args = [], options = {}) {
    console.log(chalk.blue(`🚀 Starting ${name}...`));

    const logStream = this.createLogStream(name.toLowerCase());
    const errorLogStream = this.createLogStream('error');

    // Handle Windows npm command
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';
    const finalCommand = command === 'npm' ? npmCommand : command;

    const service = spawn(finalCommand, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: isWindows,
      ...options
    });

    // Log stdout
    service.stdout.on('data', (data) => {
      const message = data.toString();
      process.stdout.write(chalk.blue(`[${name}] `) + message);
      logStream.write(`${new Date().toISOString()} ${message}`);
    });

    // Log stderr
    service.stderr.on('data', (data) => {
      const message = data.toString();
      process.stderr.write(chalk.red(`[${name}] `) + message);
      errorLogStream.write(`${new Date().toISOString()} [${name}] ${message}`);
    });

    service.on('close', (code) => {
      const message = `${name} exited with code ${code}\n`;
      if (code === 0) {
        console.log(chalk.green(`✅ ${message}`));
      } else {
        console.log(chalk.red(`❌ ${message}`));
      }
      logStream.end();
      this.services.delete(name);
    });

    service.on('error', (error) => {
      console.error(chalk.red(`❌ Failed to start ${name}:`), error.message);
      errorLogStream.write(`${new Date().toISOString()} [${name}] ERROR: ${error.message}\n`);
    });

    this.services.set(name, { process: service, logStream, errorLogStream });
    console.log(chalk.green(`✅ ${name} started (PID: ${service.pid})`));

    return service;
  }

  stopService(name) {
    const service = this.services.get(name);
    if (service) {
      console.log(chalk.yellow(`🛑 Stopping ${name}...`));
      service.process.kill('SIGTERM');
      service.logStream.end();
      service.errorLogStream.end();
    }
  }

  stopAllServices() {
    for (const [name] of this.services) {
      this.stopService(name);
    }
    
    // Wait a bit for graceful shutdown
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }

  async checkHealth() {
    const http = require('http');
    
    return new Promise((resolve) => {
      const request = http.get('http://localhost:3000/health', (res) => {
        resolve(res.statusCode === 200);
      });
      
      request.on('error', () => resolve(false));
      request.setTimeout(5000, () => {
        request.destroy();
        resolve(false);
      });
    });
  }

  async waitForService(name, checkFn, timeout = 30000) {
    console.log(chalk.yellow(`⏳ Waiting for ${name} to be ready...`));
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await checkFn()) {
        console.log(chalk.green(`✅ ${name} is ready!`));
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(chalk.red(`❌ ${name} failed to start within ${timeout}ms`));
    return false;
  }
}

async function main() {
  const manager = new ServiceManager();
  const dockerManager = new DockerManager();
  
  console.log(chalk.blue('🎯 Primrose Service Manager\n'));
  
  // Clear old logs
  const oldLogs = ['backend.log', 'frontend.log', 'error.log'];
  oldLogs.forEach(logFile => {
    const logPath = path.join(LOGS_DIR, logFile);
    if (fs.existsSync(logPath)) {
      fs.truncateSync(logPath, 0);
    }
  });
  
  // Start Docker services if configured
  if (process.env.DOCKER_MONGODB === 'true') {
    console.log(chalk.blue('🐳 Starting Docker services...\n'));
    const dockerStarted = await dockerManager.startServices();
    if (!dockerStarted) {
      console.log(chalk.red('❌ Failed to start Docker services, aborting...'));
      return;
    }
    console.log();
  }
  
  console.log(chalk.blue('📋 Starting application services...\n'));
  
  // Start backend
  manager.startService('Backend', 'npm', ['run', 'dev'], {
    env: { ...process.env },
    cwd: process.cwd()
  });
  
  // Wait for backend to be ready
  const backendReady = await manager.waitForService('Backend', () => manager.checkHealth());
  
  if (!backendReady) {
    console.log(chalk.red('❌ Backend failed to start, aborting...'));
    manager.stopAllServices();
    return;
  }
  
  // Start frontend (if package.json has frontend script)
     try {
     const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
     if (packageJson.scripts && packageJson.scripts['frontend:dev']) {
       manager.startService('Frontend', 'npm', ['run', 'frontend:dev'], {
         env: { ...process.env },
         cwd: process.cwd()
       });
     } else {
       console.log(chalk.yellow('ℹ️  No frontend:dev script found, skipping frontend'));
     }
   } catch (error) {
     console.log(chalk.yellow('ℹ️  Could not read package.json, skipping frontend'));
   }
  
  console.log(chalk.green('\n🎉 All services started successfully!'));
  console.log(chalk.blue('📊 Logs are being written to: ') + chalk.gray(LOGS_DIR));
  console.log(chalk.blue('🔍 View logs with: ') + chalk.gray('npm run services:logs'));
  console.log(chalk.yellow('⚠️  Press Ctrl+C to stop all services\n'));
  
  // Keep the process running
  setInterval(() => {
    // Just keep alive
  }, 1000);
}

main().catch(error => {
  console.error(chalk.red('❌ Service manager failed:'), error.message);
  process.exit(1);
}); 