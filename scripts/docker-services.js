const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class DockerManager {
  constructor() {
    this.composeFile = path.join(__dirname, '../docker-compose.yml');
  }

  async checkDockerInstalled() {
    try {
      execSync('docker --version', { stdio: 'ignore' });
      execSync('docker compose version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Docker or Docker Compose not found!'));
      console.log(chalk.yellow('Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/'));
      return false;
    }
  }

  async checkDockerRunning() {
    try {
      execSync('docker info', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Docker is not running!'));
      console.log(chalk.yellow('Please start Docker Desktop and try again.'));
      return false;
    }
  }

  async startServices() {
    console.log(chalk.blue('🐳 Starting Docker services...'));
    
    if (!await this.checkDockerInstalled()) return false;
    if (!await this.checkDockerRunning()) return false;

    try {
      // Start services in detached mode
      execSync('docker compose up -d', { 
        stdio: 'inherit',
        cwd: path.dirname(this.composeFile)
      });
      
      console.log(chalk.green('✅ Docker services started successfully!'));
      
      // Wait for MongoDB to be ready
      await this.waitForMongoDB();
      
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Failed to start Docker services:'), error.message);
      return false;
    }
  }

  async stopServices() {
    console.log(chalk.yellow('🛑 Stopping Docker services...'));
    
    try {
      execSync('docker compose down', { 
        stdio: 'inherit',
        cwd: path.dirname(this.composeFile)
      });
      console.log(chalk.green('✅ Docker services stopped successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to stop Docker services:'), error.message);
    }
  }

  async waitForMongoDB(timeout = 30000) {
    console.log(chalk.yellow('⏳ Waiting for MongoDB to be ready...'));
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        execSync('docker exec primrose-mongodb mongosh --eval "db.runCommand({ ping: 1 })"', { 
          stdio: 'ignore' 
        });
        console.log(chalk.green('✅ MongoDB is ready!'));
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(chalk.red('❌ MongoDB failed to start within timeout'));
    return false;
  }

  async getStatus() {
    try {
      const output = execSync('docker compose ps --format json', { 
        encoding: 'utf8',
        cwd: path.dirname(this.composeFile)
      });
      
      const containers = output.trim().split('\n')
        .filter(line => line)
        .map(line => JSON.parse(line));
      
      console.log(chalk.blue('📊 Docker Services Status:\n'));
      
      containers.forEach(container => {
        const status = container.State === 'running' 
          ? chalk.green('🟢 Running') 
          : chalk.red('🔴 Stopped');
        
        console.log(`${container.Service}: ${status}`);
        if (container.Publishers) {
          container.Publishers.forEach(port => {
            console.log(`  └─ Port: ${port.PublishedPort} → ${port.TargetPort}`);
          });
        }
      });

      return containers;
    } catch (error) {
      console.log(chalk.yellow('ℹ️  No Docker services running'));
      return [];
    }
  }

  async showLogs(service = '') {
    try {
      const command = service 
        ? `docker compose logs -f ${service}`
        : 'docker compose logs -f';
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: path.dirname(this.composeFile)
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to show logs:'), error.message);
    }
  }
}

// Command line interface
async function main() {
  const manager = new DockerManager();
  const command = process.argv[2] || 'start';

  switch (command) {
    case 'start':
      await manager.startServices();
      break;
    case 'stop':
      await manager.stopServices();
      break;
    case 'status':
      await manager.getStatus();
      break;
    case 'logs':
      const service = process.argv[3];
      await manager.showLogs(service);
      break;
    case 'restart':
      await manager.stopServices();
      await new Promise(resolve => setTimeout(resolve, 2000));
      await manager.startServices();
      break;
    default:
      console.log(chalk.yellow('Usage:'));
      console.log('  node scripts/docker-services.js start    - Start all services');
      console.log('  node scripts/docker-services.js stop     - Stop all services');
      console.log('  node scripts/docker-services.js restart  - Restart all services');
      console.log('  node scripts/docker-services.js status   - Show service status');
      console.log('  node scripts/docker-services.js logs [service] - Show logs');
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('❌ Docker manager failed:'), error.message);
    process.exit(1);
  });
}

module.exports = { DockerManager }; 