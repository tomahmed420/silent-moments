const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const componentsDir = path.join(__dirname, 'src/components/ui');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const compName = file.replace('.tsx', '');
  try {
    const res = execSync(`grep -rn "components/ui/${compName}" src/`, { encoding: 'utf8' });
    // if res has output other than itself, it's used
  } catch (e) {
    console.log(`Unused: src/components/ui/${file}`);
  }
}
