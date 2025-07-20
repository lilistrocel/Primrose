const http = require('http');
const { execSync } = require('child_process');
const chalk = require('chalk');

const services = [
  {
    name: 'Backend API',
    url: 'http://localhost:3000/health',
    required: true
  },
  {
    name: 'MongoDB',
    check: () => {
      try {
        execSync('mongod --version', { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    required: true
  }
];

async function checkHttpService(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function runHealthCheck() {
  console.log(chalk.blue('🔍 Running Health Check...\n'));
  
  let allHealthy = true;
  
  for (const service of services) {
    process.stdout.write(`Checking ${service.name}... `);
    
    let isHealthy = false;
    
    if (service.url) {
      isHealthy = await checkHttpService(service.url);
    } else if (service.check) {
      isHealthy = service.check();
    }
    
    if (isHealthy) {
      console.log(chalk.green('✅ Healthy'));
    } else {
      console.log(chalk.red('❌ Unhealthy'));
      if (service.required) {
        allHealthy = false;
      }
    }
  }
  
  console.log();
  
  if (allHealthy) {
    console.log(chalk.green('🎉 All services are healthy!'));
    process.exit(0);
  } else {
    console.log(chalk.red('⚠️  Some required services are unhealthy'));
    process.exit(1);
  }
}

runHealthCheck().catch(error => {
  console.error(chalk.red('Health check failed:'), error.message);
  process.exit(1);
}); 