const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SecurityChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.info = [];
  }

  addIssue(message, level = 'error') {
    const entry = { message, level, timestamp: new Date().toISOString() };
    
    switch (level) {
      case 'error':
        this.issues.push(entry);
        break;
      case 'warning':
        this.warnings.push(entry);
        break;
      case 'info':
        this.info.push(entry);
        break;
    }
  }

  checkEnvironmentSecrets(env = 'production') {
    console.log(chalk.blue('🔐 Checking environment secrets...'));
    
    const envFile = env === 'development' ? '.env' : `.env.${env}`;
    
    if (!fs.existsSync(envFile)) {
      this.addIssue(`Environment file ${envFile} not found`, 'error');
      return;
    }

    const content = fs.readFileSync(envFile, 'utf8');
    const lines = content.split('\n');

    // Check for weak secrets
    const weakPatterns = [
      { pattern: /JWT_SECRET=.*test.*|JWT_SECRET=.*dev.*|JWT_SECRET=.*123.*/, message: 'Weak JWT secret detected' },
      { pattern: /PASSWORD=.*password.*|PASSWORD=.*123.*|PASSWORD=.*admin.*/, message: 'Weak password detected' },
      { pattern: /SECRET=.*secret.*|SECRET=.*key.*/, message: 'Generic secret value detected' },
      { pattern: /CHANGE_THIS/, message: 'Placeholder values not replaced' },
    ];

    lines.forEach((line, index) => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        
        // Check minimum lengths
        if (key.includes('SECRET') && value.length < 32) {
          this.addIssue(`Secret ${key} is too short (minimum 32 characters)`, 'warning');
        }
        
        if (key.includes('PASSWORD') && value.length < 12) {
          this.addIssue(`Password ${key} is too short (minimum 12 characters)`, 'warning');
        }

        // Check for weak patterns
        weakPatterns.forEach(({ pattern, message }) => {
          if (pattern.test(line)) {
            this.addIssue(`${message}: ${key} (line ${index + 1})`, 'error');
          }
        });
      }
    });
  }

  checkFilePermissions() {
    console.log(chalk.blue('📁 Checking file permissions...'));
    
    const sensitiveFiles = ['.env', '.env.production', '.env.staging'];
    
    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          // On Windows, we can't check Unix permissions, so just warn about existence
          this.addIssue(`Sensitive file ${file} exists - ensure it's not in version control`, 'warning');
        } catch (error) {
          this.addIssue(`Cannot check permissions for ${file}: ${error.message}`, 'warning');
        }
      }
    });
  }

  checkDependencyVulnerabilities() {
    console.log(chalk.blue('📦 Checking dependency vulnerabilities...'));
    
    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        const { high, critical, moderate, low } = audit.metadata.vulnerabilities;
        
        if (critical > 0) {
          this.addIssue(`${critical} critical vulnerabilities found`, 'error');
        }
        if (high > 0) {
          this.addIssue(`${high} high vulnerabilities found`, 'error');
        }
        if (moderate > 0) {
          this.addIssue(`${moderate} moderate vulnerabilities found`, 'warning');
        }
        if (low > 0) {
          this.addIssue(`${low} low vulnerabilities found`, 'info');
        }
      } else {
        this.addIssue('No known vulnerabilities found', 'info');
      }
    } catch (error) {
      this.addIssue('Could not run security audit - ensure npm is installed', 'warning');
    }
  }

  checkDockerSecurity() {
    console.log(chalk.blue('🐳 Checking Docker security...'));
    
    // Check if Dockerfile follows security best practices
    if (fs.existsSync('Dockerfile')) {
      const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
      
      if (!dockerfile.includes('USER ')) {
        this.addIssue('Dockerfile should include USER instruction (non-root user)', 'error');
      }
      
      if (!dockerfile.includes('HEALTHCHECK')) {
        this.addIssue('Dockerfile should include HEALTHCHECK instruction', 'warning');
      }
      
      if (dockerfile.includes('FROM node:') && !dockerfile.includes('alpine')) {
        this.addIssue('Consider using Alpine Linux for smaller attack surface', 'info');
      }

      if (!dockerfile.includes('dumb-init')) {
        this.addIssue('Consider using dumb-init for proper signal handling', 'info');
      }
    }
  }

  checkGitSecurity() {
    console.log(chalk.blue('📋 Checking Git security...'));
    
    // Check .gitignore
    if (fs.existsSync('.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      
      const requiredEntries = ['.env', '.env.*', 'node_modules/', '*.log'];
      
      requiredEntries.forEach(entry => {
        if (!gitignore.includes(entry)) {
          this.addIssue(`Add ${entry} to .gitignore`, 'warning');
        }
      });
    } else {
      this.addIssue('.gitignore file not found', 'error');
    }

    // Check for committed secrets
    try {
      const gitLogs = execSync('git log --oneline -n 10', { encoding: 'utf8' });
      if (gitLogs.includes('password') || gitLogs.includes('secret') || gitLogs.includes('key')) {
        this.addIssue('Potential secrets in git commit messages', 'warning');
      }
    } catch (error) {
      this.addIssue('Could not check git history', 'info');
    }
  }

  checkApplicationSecurity() {
    console.log(chalk.blue('🛡️ Checking application security configuration...'));
    
    // Check if security middleware is properly configured
    const indexFile = 'src/index.ts';
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      
      const securityChecks = [
        { pattern: /helmet/, message: 'Helmet middleware configured', level: 'info' },
        { pattern: /cors/, message: 'CORS middleware configured', level: 'info' },
        { pattern: /rateLimit/, message: 'Rate limiting configured', level: 'info' },
      ];

      securityChecks.forEach(({ pattern, message, level }) => {
        if (pattern.test(content)) {
          this.addIssue(message, level);
        } else {
          this.addIssue(`Missing: ${message}`, 'warning');
        }
      });
    }
  }

  generateReport() {
    console.log(chalk.blue('\n📊 Security Report\n'));
    
    // Summary
    console.log(chalk.red(`❌ Issues: ${this.issues.length}`));
    console.log(chalk.yellow(`⚠️  Warnings: ${this.warnings.length}`));
    console.log(chalk.blue(`ℹ️  Info: ${this.info.length}\n`));

    // Details
    if (this.issues.length > 0) {
      console.log(chalk.red('🚨 CRITICAL ISSUES:'));
      this.issues.forEach(issue => {
        console.log(chalk.red(`  • ${issue.message}`));
      });
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  WARNINGS:'));
      this.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning.message}`));
      });
      console.log();
    }

    if (this.info.length > 0) {
      console.log(chalk.blue('ℹ️  INFORMATION:'));
      this.info.forEach(info => {
        console.log(chalk.blue(`  • ${info.message}`));
      });
      console.log();
    }

    // Recommendations
    console.log(chalk.blue('💡 RECOMMENDATIONS:\n'));
    console.log('1. Fix all critical issues before production deployment');
    console.log('2. Generate strong secrets: openssl rand -hex 32');
    console.log('3. Use environment variable injection in production');
    console.log('4. Enable Docker security scanning in CI/CD');
    console.log('5. Set up automated dependency updates');
    console.log('6. Monitor security advisories regularly');

    // Return exit code based on issues
    return this.issues.length > 0 ? 1 : 0;
  }

  async runAllChecks(environment = 'production') {
    console.log(chalk.blue(`🔍 Running security checks for ${environment} environment...\n`));
    
    try {
      this.checkEnvironmentSecrets(environment);
      this.checkFilePermissions();
      this.checkDependencyVulnerabilities();
      this.checkDockerSecurity();
      this.checkGitSecurity();
      this.checkApplicationSecurity();
      
      return this.generateReport();
    } catch (error) {
      console.error(chalk.red('Security check failed:'), error.message);
      return 1;
    }
  }
}

// Command line interface
async function main() {
  const checker = new SecurityChecker();
  const environment = process.argv[2] || 'production';
  
  const exitCode = await checker.runAllChecks(environment);
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { SecurityChecker }; 