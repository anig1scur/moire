import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEMOS_DIR = path.resolve(__dirname, '../src/memos');

/**
 * Normalizes UTC offset to ISO format (+HH:mm or -HH:mm)
 */
function normalizeUtcOffset(offset) {
    const num = parseFloat(offset);
    if (isNaN(num)) return offset;
    const sign = num >= 0 ? '+' : '-';
    const absOffset = Math.abs(num);
    const hours = Math.floor(absOffset);
    const minutes = (absOffset % 1) * 60;
    return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Recursively gets all markdown files in a directory
 */
function getAllFiles (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

async function migrate() {
    const args = process.argv.slice(2);
    const offsetArg = args[0];

    if (!offsetArg) {
        console.error('Usage: node scripts/migrate-to-utc.js <your_previous_utc_offset>');
        console.error('Example: node scripts/migrate-to-utc.js 8');
        process.exit(1);
    }

    const offset = normalizeUtcOffset(offsetArg);
    console.log(`Migrating memos from offset ${offset} to UTC...`);

  console.log(`Checking directory: ${MEMOS_DIR}`);
  const files = getAllFiles(MEMOS_DIR);
  console.log(`Found ${files.length} markdown files.`);

  for (const filePath of files) {
    const file = path.basename(filePath);
        const slug = file.replace('.md', '');
        const match = slug.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
        
        if (!match) {
          console.log(`Skipping non-timestamped file: ${filePath}`);
            continue;
        }

        const [_, year, month, day, hour, minute, second] = match;
        const localIso = `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
        const date = new Date(localIso);

        if (isNaN(date.getTime())) {
          console.error(`Invalid date for file: ${filePath}`);
            continue;
        }

        // Generate UTC timestamp YYYYMMDDHHmmss
        const utcYear = date.getUTCFullYear();
    const utcMonthNum = date.getUTCMonth() + 1;
    const utcMonth = String(utcMonthNum).padStart(2, '0');
        const utcDay = String(date.getUTCDate()).padStart(2, '0');
        const utcHour = String(date.getUTCHours()).padStart(2, '0');
        const utcMinute = String(date.getUTCMinutes()).padStart(2, '0');
        const utcSecond = String(date.getUTCSeconds()).padStart(2, '0');

        const newSlug = `${utcYear}${utcMonth}${utcDay}${utcHour}${utcMinute}${utcSecond}`;
        const newFile = `${newSlug}.md`;

    // Correct directory based on UTC date
    const newDirName = `${utcYear}-${utcMonth}`;
    const newDirPath = path.join(MEMOS_DIR, newDirName);
    const newPath = path.join(newDirPath, newFile);

    if (filePath === newPath) {
      console.log(`File already matches UTC and correct directory: ${file}`);
            continue;
        }

        if (fs.existsSync(newPath)) {
          console.warn(`Warning: Destination file ${newPath} already exists. Skipping ${filePath} to avoid overwrite.`);
            continue;
        }

    if (!fs.existsSync(newDirPath)) {
      fs.mkdirSync(newDirPath, { recursive: true });
    }

    console.log(`Moving: ${filePath} -> ${newPath}`);
    fs.renameSync(filePath, newPath);

    // Try to remove old directory if empty
    const oldDirPath = path.dirname(filePath);
    if (oldDirPath !== MEMOS_DIR && fs.readdirSync(oldDirPath).length === 0) {
      console.log(`Removing empty directory: ${oldDirPath}`);
      fs.rmdirSync(oldDirPath);
    }
    }

    console.log('Migration complete!');
}

migrate().catch(console.error);