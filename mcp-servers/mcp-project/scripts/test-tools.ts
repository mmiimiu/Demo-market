import {
  getProjectDir,
  scanTodos,
  getApiRoutes,
  checkEnvVars,
  getDbSchema,
  runLinter,
  checkVulnerabilities
} from '../src/project-scanner.js';

const dir = getProjectDir();

console.log('Testing project-scanner.ts on:', dir);

console.log('\n--- 1. Testing scanTodos ---');
const todos = scanTodos(dir);
console.log(`Found ${todos.length} TODOs/FIXMEs:`, todos);

console.log('\n--- 2. Testing getApiRoutes ---');
const routes = getApiRoutes(dir);
console.log(`Found ${routes.length} API routes:`, routes);

console.log('\n--- 3. Testing checkEnvVars ---');
const envVars = checkEnvVars(dir);
console.log(`Found env vars:`, envVars);

console.log('\n--- 4. Testing getDbSchema ---');
const schema = getDbSchema(dir);
console.log(`DB Schema:`, schema);

console.log('\n--- 5. Testing runLinter ---');
const linterRes = await runLinter(dir);
console.log(`Linter Output:`, linterRes);

console.log('\n--- 6. Testing checkVulnerabilities ---');
const vulnsRes = await checkVulnerabilities(dir);
console.log(`Vulnerabilities (npm audit):`, vulnsRes.output.substring(0, 500) + '...');
