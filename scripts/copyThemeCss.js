// scripts/copyThemeCss.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Determine which env file to load: .env first, then .env.local if not found.
const envPath = fs.existsSync(path.resolve(process.cwd(), '.env'))
  ? path.resolve(process.cwd(), '.env')
  : fs.existsSync(path.resolve(process.cwd(), '.env.local'))
    ? path.resolve(process.cwd(), '.env.local')
    : null;

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment variables from ${envPath}`);
} else {
  console.warn('No .env or .env.local file found. Using process.env directly.');
}

// Determine the site theme from the environment variable, defaulting to 'default'
const siteTheme = process.env.SITE_THEME || 'default';

// Define source and destination directories
const srcDir = path.resolve(
  process.cwd(),
  'node_modules/@conversiondigital/headless-basics-components/src/theme',
  siteTheme,
  'styles'
);
const destDir = path.resolve(process.cwd(), `theme/styles/component-lib-transfer`);

const configSrcPath = path.resolve(
  process.cwd(),
  'node_modules/@conversiondigital/headless-basics-components/src/theme',
  siteTheme,
  'tailwind.config.js'
);
const configDestPath = path.resolve(process.cwd(), 'theme/styles/tailwind.config.js');

console.log(`Copying theme CSS for "${siteTheme}"...`);
console.log(`Source directory: ${srcDir}`);
console.log(`Destination directory: ${destDir}`);

try {
  // Ensure the destination directory exists
  fs.mkdirSync(destDir, { recursive: true });

  // Read all files in the source directory
  const files = fs.readdirSync(srcDir);
  // Filter for only CSS files
  const cssFiles = files.filter(file => path.extname(file).toLowerCase() === '.css');

  // Copy each CSS file to the destination directory
  cssFiles.forEach(file => {
    const sourceFilePath = path.join(srcDir, file);
    const destinationFilePath = path.join(destDir, file);
    fs.copyFileSync(sourceFilePath, destinationFilePath);
    console.log(`Successfully copied ${sourceFilePath} to ${destinationFilePath}`);
  });

  if (cssFiles.length === 0) {
    console.warn('No CSS files found to copy.');
  }

  // Copy tailwind.config.js if it exists
  if (fs.existsSync(configSrcPath)) {
    fs.mkdirSync(path.dirname(configDestPath), { recursive: true });
    fs.copyFileSync(configSrcPath, configDestPath);
    console.log(`Successfully copied ${configSrcPath} to ${configDestPath}`);
  } else {
    console.warn(`No tailwind.config.js found at ${configSrcPath}`);
  }
} catch (error) {
  console.error('Error copying theme files:', error);
  process.exit(1);
}
