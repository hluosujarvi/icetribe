#!/usr/bin/env node

const { spawn } = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

class TestRunner {
  constructor() {
    this.hugoProcess = null;
    this.testResults = [];
    this.projectRoot = process.cwd();
  }

  log(type, message) {
    const timestamp = new Date().toLocaleTimeString('fi-FI');
    const prefix = `[${timestamp}]`;
    
    if (type === 'error') {
      console.log(chalk.red(`${prefix} ❌ ${message}`));
    } else if (type === 'warning') {
      console.log(chalk.yellow(`${prefix} ⚠️  ${message}`));
    } else if (type === 'info') {
      console.log(chalk.blue(`${prefix} ℹ️  ${message}`));
    } else {
      console.log(chalk.green(`${prefix} ✅ ${message}`));
    }
  }

  async startHugoServer() {
    return new Promise((resolve, reject) => {
      this.log('info', 'Starting Hugo development server...');
      
      this.hugoProcess = spawn('hugo', ['server', '--port', '1313', '--disableFastRender'], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let serverReady = false;
      let timeout = setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Hugo server failed to start within 10 seconds'));
        }
      }, 10000);

      this.hugoProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Web Server is available at') || output.includes('localhost:1313')) {
          if (!serverReady) {
            serverReady = true;
            clearTimeout(timeout);
            this.log('pass', 'Hugo server started successfully');
            // Wait a bit more for full startup
            setTimeout(resolve, 2000);
          }
        }
      });

      this.hugoProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.log(chalk.red(error));
      });

      this.hugoProcess.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.hugoProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          reject(new Error(`Hugo server exited with code ${code}`));
        }
      });
    });
  }

  async stopHugoServer() {
    if (this.hugoProcess) {
      this.log('info', 'Stopping Hugo server...');
      this.hugoProcess.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        if (this.hugoProcess.killed) {
          resolve();
        } else {
          this.hugoProcess.on('exit', resolve);
          // Force kill after 5 seconds
          setTimeout(() => {
            if (!this.hugoProcess.killed) {
              this.hugoProcess.kill('SIGKILL');
              resolve();
            }
          }, 5000);
        }
      });
      
      this.hugoProcess = null;
      this.log('pass', 'Hugo server stopped');
    }
  }

  async runTest(testFile) {
    return new Promise((resolve) => {
      this.log('info', `Running ${path.basename(testFile)}...`);
      
      const testProcess = spawn('node', [testFile], {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      testProcess.on('exit', (code) => {
        const testName = path.basename(testFile, '.js');
        const result = {
          name: testName,
          file: testFile,
          success: code === 0,
          exitCode: code,
          timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (code === 0) {
          this.log('pass', `${testName} passed`);
        } else {
          this.log('error', `${testName} failed (exit code: ${code})`);
        }
        
        resolve(result);
      });

      testProcess.on('error', (error) => {
        this.log('error', `Failed to run ${testFile}: ${error.message}`);
        resolve({
          name: path.basename(testFile, '.js'),
          file: testFile,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async checkDependencies() {
    this.log('info', 'Checking dependencies...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      throw new Error('package.json not found. Run: npm init -y');
    }

    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (!await fs.pathExists(nodeModulesPath)) {
      this.log('info', 'Installing dependencies...');
      
      await new Promise((resolve, reject) => {
        const npmProcess = spawn('npm', ['install'], {
          cwd: this.projectRoot,
          stdio: 'inherit'
        });
        
        npmProcess.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`npm install failed with code ${code}`));
          }
        });
      });
    }

    this.log('pass', 'Dependencies ready');
  }

  async generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(chalk.blue('\n🧪 Test Results Summary:'));
    console.log(chalk.cyan(`Total tests: ${totalTests}`));
    console.log(chalk.green(`Passed: ${passedTests}`));
    console.log(chalk.red(`Failed: ${failedTests}`));
    
    if (failedTests > 0) {
      console.log(chalk.red('\nFailed tests:'));
      this.testResults
        .filter(r => !r.success)
        .forEach(r => console.log(chalk.red(`  - ${r.name}`)));
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
      },
      results: this.testResults,
      hugo: {
        version: await this.getHugoVersion(),
        serverUsed: true
      }
    };

    const reportPath = 'tests/test-report.json';
    await fs.writeJson(reportPath, report, { spaces: 2 });
    this.log('info', `Detailed report saved to ${reportPath}`);
    
    return failedTests === 0;
  }

  async getHugoVersion() {
    try {
      return await new Promise((resolve) => {
        const process = spawn('hugo', ['version'], { stdio: 'pipe' });
        let output = '';
        
        process.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        process.on('exit', () => {
          resolve(output.trim() || 'Unknown');
        });
      });
    } catch {
      return 'Hugo not found';
    }
  }

  async findTestFiles() {
    const testDir = path.join(this.projectRoot, 'tests');
    if (!await fs.pathExists(testDir)) {
      throw new Error('Tests directory not found');
    }

    const files = await fs.readdir(testDir);
    return files
      .filter(file => file.endsWith('.js') && file !== 'run-tests.js')
      .map(file => path.join(testDir, file))
      .sort();
  }

  async run() {
    console.log(chalk.blue('🚀 Starting Icetribe website tests...\n'));
    
    try {
      // Check dependencies
      await this.checkDependencies();
      
      // Find test files
      const testFiles = await this.findTestFiles();
      if (testFiles.length === 0) {
        throw new Error('No test files found');
      }
      
      this.log('info', `Found ${testFiles.length} test files`);
      
      // Start Hugo server
      await this.startHugoServer();
      
      // Run all tests
      for (const testFile of testFiles) {
        await this.runTest(testFile);
      }
      
    } catch (error) {
      this.log('error', error.message);
      return false;
    } finally {
      // Always stop the server
      await this.stopHugoServer();
    }

    // Generate report
    const allPassed = await this.generateReport();
    
    if (allPassed) {
      console.log(chalk.green('\n🎉 All tests passed! Website is ready for deployment.'));
      return true;
    } else {
      console.log(chalk.red('\n💥 Some tests failed. Please check the issues above.'));
      return false;
    }
  }
}

// Allow both direct execution and module import
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().then((success) => {
    process.exit(success ? 0 : 1);
  }).catch((error) => {
    console.error(chalk.red('Test runner error:', error.message));
    process.exit(1);
  });
}

module.exports = TestRunner;