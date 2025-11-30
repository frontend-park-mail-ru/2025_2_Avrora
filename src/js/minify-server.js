import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function minifyServerFiles() {
  try {
    const serverFile = path.join(__dirname, '../../server.js');
    const distDir = path.join(__dirname, '../../dist-server');

    try {
      await fs.access(distDir);
    } catch {
      await fs.mkdir(distDir, { recursive: true });
    }

    const code = await fs.readFile(serverFile, 'utf8');

    const result = await minify(code, {
      compress: {
        drop_console: false,
        drop_debugger: true,
        dead_code: true,
        unused: true,
        arguments: true,
        join_vars: true,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        sequences: true
      },
      mangle: {
        toplevel: true
      },
      format: {
        comments: false
      }
    });

    if (result.error) {
      throw new Error(`Error minifying server.js: ${result.error}`);
    }

    const outputPath = path.join(distDir, 'server.js');
    await fs.writeFile(outputPath, result.code);

  } catch (error) {
    process.exit(1);
  }
}

minifyServerFiles();