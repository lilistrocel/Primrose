const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

const LOGS_DIR = path.join(__dirname, '../logs');
const MAX_LINES = 100;

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function formatLogLine(line, service) {
  const timestamp = new Date().toISOString();
  const serviceColor = service === 'backend' ? chalk.blue : chalk.green;
  
  return `${chalk.gray(timestamp)} ${serviceColor(`[${service.toUpperCase()}]`)} ${line}`;
}

function readLogFile(filename, lines = MAX_LINES) {
  const filepath = path.join(LOGS_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const logLines = content.trim().split('\n').filter(line => line);
    return logLines.slice(-lines);
  } catch (error) {
    console.error(chalk.red(`Error reading ${filename}:`), error.message);
    return [];
  }
}

function displayLogs(service = 'all', lines = MAX_LINES) {
  console.log(chalk.blue('📋 Service Logs\n'));
  
  if (service === 'all' || service === 'backend') {
    console.log(chalk.blue('=== BACKEND LOGS ==='));
    const backendLogs = readLogFile('backend.log', lines);
    backendLogs.forEach(line => console.log(formatLogLine(line, 'backend')));
    console.log();
  }
  
  if (service === 'all' || service === 'frontend') {
    console.log(chalk.green('=== FRONTEND LOGS ==='));
    const frontendLogs = readLogFile('frontend.log', lines);
    frontendLogs.forEach(line => console.log(formatLogLine(line, 'frontend')));
    console.log();
  }
  
  if (service === 'all' || service === 'error') {
    console.log(chalk.red('=== ERROR LOGS ==='));
    const errorLogs = readLogFile('error.log', lines);
    errorLogs.forEach(line => console.log(chalk.red(line)));
  }
}

function clearLogs() {
  try {
    const files = fs.readdirSync(LOGS_DIR);
    files.forEach(file => {
      if (file.endsWith('.log')) {
        fs.unlinkSync(path.join(LOGS_DIR, file));
      }
    });
    console.log(chalk.green('✅ All logs cleared'));
  } catch (error) {
    console.error(chalk.red('Error clearing logs:'), error.message);
  }
}

function showLogStats() {
  try {
    const files = fs.readdirSync(LOGS_DIR);
    const logFiles = files.filter(file => file.endsWith('.log'));
    
    console.log(chalk.blue('📊 Log Statistics\n'));
    
    logFiles.forEach(file => {
      const filepath = path.join(LOGS_DIR, file);
      const stats = fs.statSync(filepath);
      const lines = readLogFile(file, Infinity).length;
      
      console.log(`${chalk.yellow(file)}:`);
      console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`  Lines: ${lines}`);
      console.log(`  Modified: ${stats.mtime.toLocaleString()}`);
      console.log();
    });
  } catch (error) {
    console.error(chalk.red('Error getting log stats:'), error.message);
  }
}

// Command line interface
const command = process.argv[2] || 'show';
const service = process.argv[3] || 'all';
const lines = parseInt(process.argv[4]) || MAX_LINES;

switch (command) {
  case 'show':
    displayLogs(service, lines);
    break;
  case 'clear':
    clearLogs();
    break;
  case 'stats':
    showLogStats();
    break;
  case 'tail':
    console.log(chalk.blue(`📡 Tailing logs for ${service}...`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    // Initial display
    displayLogs(service, 10);
    
    // Watch for changes
    const logFile = path.join(LOGS_DIR, `${service === 'all' ? 'backend' : service}.log`);
    if (fs.existsSync(logFile)) {
      try {
        execSync(`tail -f ${logFile}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(chalk.red('Error tailing logs:'), error.message);
      }
    }
    break;
  default:
    console.log(chalk.yellow('Usage:'));
    console.log('  node scripts/log-viewer.js show [service] [lines]  - Show logs');
    console.log('  node scripts/log-viewer.js clear                  - Clear all logs');
    console.log('  node scripts/log-viewer.js stats                  - Show log statistics');
    console.log('  node scripts/log-viewer.js tail [service]         - Tail logs in real-time');
    console.log();
    console.log(chalk.yellow('Services:'), 'all, backend, frontend, error');
    break;
} 