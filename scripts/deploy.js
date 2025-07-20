const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class DeploymentManager {
  constructor() {
    this.environments = ['development', 'staging', 'production'];
    this.requiredEnvVars = [
      'JWT_SECRET',
      'MONGODB_PASSWORD',
      'MONGODB_ADMIN_PASSWORD'
    ];
  }

  async validateEnvironment(env) {
    console.log(chalk.blue(`🔍 Validating ${env} environment...`));

    // Check if environment file exists
    const envFile = env === 'development' ? '.env' : `.env.${env}`;
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file ${envFile} not found`);
    }

    // Load environment variables
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
      }
    });

    // Check required variables
    const missing = this.requiredEnvVars.filter(varName => 
      !envVars[varName] || envVars[varName].includes('CHANGE_THIS')
    );

    if (missing.length > 0) {
      throw new Error(`Missing or placeholder values for: ${missing.join(', ')}`);
    }

    console.log(chalk.green('✅ Environment validation passed'));
    return envVars;
  }

  async runTests() {
    console.log(chalk.blue('🧪 Running test suite...'));
    
    try {
      execSync('npm test', { stdio: 'inherit' });
      console.log(chalk.green('✅ All tests passed'));
    } catch (error) {
      throw new Error('Tests failed - deployment aborted');
    }
  }

  async buildDocker(env) {
    console.log(chalk.blue(`🐳 Building Docker image for ${env}...`));
    
    const tag = `primrose-backend:${env}`;
    
    try {
      execSync(`docker build -t ${tag} .`, { stdio: 'inherit' });
      console.log(chalk.green(`✅ Docker image built: ${tag}`));
      return tag;
    } catch (error) {
      throw new Error(`Docker build failed: ${error.message}`);
    }
  }

  async deployLocal(env) {
    console.log(chalk.blue(`🚀 Deploying to local ${env}...`));
    
    const composeFile = env === 'production' ? 'docker-compose.prod.yml' : 'docker-compose.yml';
    const envFile = env === 'development' ? '.env' : `.env.${env}`;

    try {
      // Stop existing services
      execSync(`docker-compose -f ${composeFile} --env-file ${envFile} down`, { 
        stdio: 'inherit' 
      });

      // Start new services
      const command = env === 'production' 
        ? `docker-compose -f ${composeFile} --env-file ${envFile} --profile monitoring up -d`
        : `docker-compose -f ${composeFile} --env-file ${envFile} up -d`;

      execSync(command, { stdio: 'inherit' });

      console.log(chalk.green(`✅ ${env} deployment completed`));
      
      // Wait and check health
      await this.checkHealth();
      
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  async checkHealth(retries = 5) {
    console.log(chalk.blue('🏥 Checking application health...'));
    
    for (let i = 0; i < retries; i++) {
      try {
        execSync('curl -f http://localhost:3000/health', { stdio: 'ignore' });
        console.log(chalk.green('✅ Application is healthy'));
        return true;
      } catch (error) {
        if (i === retries - 1) {
          throw new Error('Health check failed - deployment may have issues');
        }
        console.log(chalk.yellow(`⏳ Health check attempt ${i + 1}/${retries} failed, retrying...`));
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async backup(env) {
    if (env === 'production') {
      console.log(chalk.blue('💾 Creating database backup...'));
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${env}-${timestamp}`;
      
      try {
        execSync(`docker exec primrose-mongodb-prod mongodump --authenticationDatabase admin -u admin -p admin123 --db primrose --out /tmp/${backupName}`, { stdio: 'inherit' });
        execSync(`docker cp primrose-mongodb-prod:/tmp/${backupName} ./backups/`, { stdio: 'inherit' });
        
        console.log(chalk.green(`✅ Backup created: ./backups/${backupName}`));
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ Backup failed: ${error.message}`));
      }
    }
  }

  async rollback(env) {
    console.log(chalk.yellow(`🔄 Rolling back ${env} deployment...`));
    
    try {
      const composeFile = env === 'production' ? 'docker-compose.prod.yml' : 'docker-compose.yml';
      const envFile = env === 'development' ? '.env' : `.env.${env}`;
      
      execSync(`docker-compose -f ${composeFile} --env-file ${envFile} down`, { stdio: 'inherit' });
      execSync(`git checkout HEAD~1`, { stdio: 'inherit' });
      
      await this.deploy(env, { skipTests: true });
      
      console.log(chalk.green('✅ Rollback completed'));
    } catch (error) {
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }

  async deploy(environment, options = {}) {
    if (!this.environments.includes(environment)) {
      throw new Error(`Invalid environment: ${environment}`);
    }

    console.log(chalk.blue(`\n🎯 Starting ${environment} deployment...\n`));

    try {
      // Validation steps
      await this.validateEnvironment(environment);
      
      if (!options.skipTests) {
        await this.runTests();
      }

      // Production safety checks
      if (environment === 'production') {
        await this.backup(environment);
        
        console.log(chalk.yellow('⚠️  Production deployment detected!'));
        console.log(chalk.yellow('Press Ctrl+C within 10 seconds to abort...'));
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      // Build and deploy
      await this.buildDocker(environment);
      await this.deployLocal(environment);

      console.log(chalk.green(`\n🎉 ${environment} deployment completed successfully!\n`));
      
      // Show deployment info
      this.showDeploymentInfo(environment);
      
    } catch (error) {
      console.error(chalk.red(`❌ Deployment failed: ${error.message}`));
      
      if (environment === 'production') {
        console.log(chalk.yellow('🔄 Consider running rollback: npm run deploy:rollback production'));
      }
      
      process.exit(1);
    }
  }

  showDeploymentInfo(env) {
    console.log(chalk.blue('📊 Deployment Information:'));
    console.log(`🌐 Application: http://localhost:3000`);
    console.log(`🔍 Health Check: http://localhost:3000/health`);
    console.log(`📊 MongoDB Express: http://localhost:8081`);
    
    if (env === 'production') {
      console.log(`📈 Prometheus: http://localhost:9090`);
      console.log(`📊 Grafana: http://localhost:3001`);
    }
    
    console.log(`📋 Logs: npm run services:logs`);
    console.log(`🔧 Status: npm run docker:status`);
  }
}

// Command line interface
async function main() {
  const manager = new DeploymentManager();
  const command = process.argv[2];
  const environment = process.argv[3] || 'development';

  try {
    switch (command) {
      case 'deploy':
        await manager.deploy(environment);
        break;
      case 'rollback':
        await manager.rollback(environment);
        break;
      case 'health':
        await manager.checkHealth();
        break;
      case 'backup':
        await manager.backup(environment);
        break;
      default:
        console.log(chalk.yellow('Usage:'));
        console.log('  npm run deploy:dev     - Deploy to development');
        console.log('  npm run deploy:staging - Deploy to staging');
        console.log('  npm run deploy:prod    - Deploy to production');
        console.log('  npm run deploy:rollback <env> - Rollback deployment');
        console.log('  npm run deploy:health  - Check application health');
        console.log('  npm run deploy:backup <env> - Create database backup');
        break;
    }
  } catch (error) {
    console.error(chalk.red('❌ Command failed:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { DeploymentManager }; 