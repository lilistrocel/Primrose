const { spawn } = require('child_process');
const chalk = require('chalk');
const path = require('path');

class FullStackManager {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  log(service, message, color = 'white') {
    const timestamp = new Date().toLocaleTimeString();
    const serviceTag = `[${service}]`.padEnd(12);
    console.log(chalk[color](`${timestamp} ${serviceTag} ${message}`));
  }

  async startService(name, command, args, cwd, color) {
    return new Promise((resolve, reject) => {
      this.log(name, `Starting ${name}...`, color);
      
      const process = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      this.processes.push({ name, process });

      process.stdout.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          this.log(name, message, color);
        }
      });

      process.stderr.on('data', (data) => {
        const message = data.toString().trim();
        if (message && !message.includes('ExperimentalWarning')) {
          this.log(name, message, 'yellow');
        }
      });

      process.on('close', (code) => {
        if (!this.isShuttingDown) {
          this.log(name, `Process exited with code ${code}`, code === 0 ? 'green' : 'red');
        }
      });

      process.on('error', (error) => {
        this.log(name, `Error: ${error.message}`, 'red');
        reject(error);
      });

      // Consider service started after a short delay
      setTimeout(() => {
        this.log(name, `${name} started successfully`, 'green');
        resolve();
      }, 2000);
    });
  }

  async startAllServices() {
    try {
      console.log(chalk.blue('🚀 Starting Primrose Full-Stack Development Environment\n'));

      // Start Docker services first
      this.log('DOCKER', 'Starting Docker services...', 'cyan');
      await this.startService(
        'DOCKER',
        'node',
        ['scripts/docker-services.js', 'start'],
        process.cwd(),
        'cyan'
      );

      // Wait a bit for Docker to be ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Start backend
      await this.startService(
        'BACKEND',
        'npm',
        ['run', 'dev'],
        process.cwd(),
        'green'
      );

      // Start frontend
      await this.startService(
        'FRONTEND',
        'npm',
        ['run', 'dev'],
        path.join(process.cwd(), 'frontend'),
        'blue'
      );

      console.log(chalk.green('\n✅ Full-stack environment ready!\n'));
      console.log(chalk.blue('📋 Available Services:'));
      console.log('🌐 Frontend:          http://localhost:5173');
      console.log('🔌 Backend API:       http://localhost:3000');
      console.log('📊 MongoDB Express:   http://localhost:8081');
      console.log('🏥 Health Check:      http://localhost:3000/health');
      console.log('\n📝 Logs will appear below...\n');

    } catch (error) {
      console.error(chalk.red('❌ Failed to start services:'), error.message);
      this.shutdown();
    }
  }

  shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(chalk.yellow('\n🔄 Shutting down services...'));

    this.processes.forEach(({ name, process }) => {
      this.log(name, 'Stopping...', 'yellow');
      process.kill('SIGTERM');
    });

    // Force kill after 5 seconds
    setTimeout(() => {
      this.processes.forEach(({ name, process }) => {
        if (!process.killed) {
          this.log(name, 'Force stopping...', 'red');
          process.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  }

  setupGracefulShutdown() {
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n📡 Received SIGINT signal'));
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n📡 Received SIGTERM signal'));
      this.shutdown();
    });

    process.on('uncaughtException', (error) => {
      console.error(chalk.red('❌ Uncaught Exception:'), error);
      this.shutdown();
    });
  }
}

// Main execution
async function main() {
  const manager = new FullStackManager();
  manager.setupGracefulShutdown();
  
  try {
    await manager.startAllServices();
  } catch (error) {
    console.error(chalk.red('❌ Startup failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { FullStackManager }; 