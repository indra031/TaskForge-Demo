const fs = require('fs');

const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const filePath = input.tool_input?.file_path || '';

const protectedFiles = ['pom.xml', 'package.json', 'angular.json'];
const matched = protectedFiles.find(p => filePath.endsWith(p));

if (matched) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: `'${matched}' is a protected config file. Ask the user for explicit permission before modifying it.`
    }
  }));
}
