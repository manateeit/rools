#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rm = promisify(fs.rm);
const cp = promisify(fs.cp);
const copyFile = promisify(fs.copyFile);

async function listRoolsSets() {
  const roolsDir = path.join(__dirname, '..', '..', '..', '.rools');
  const entries = await readdir(roolsDir);
  const dirs = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(roolsDir, entry);
      const stats = await stat(entryPath);
      return stats.isDirectory() ? entry : null;
    })
  );
  return dirs.filter((dir) => dir !== null);
}

async function promptSelection(sets) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Select a rools set by number:\n' + sets.map((s, i) => `${i + 1}. ${s}`).join('\n') + '\n> ', (answer) => {
      rl.close();
      resolve(parseInt(answer, 10));
    });
  });
}

async function cleanTargetDir() {
  const targetDir = process.cwd();

  // Remove .roo directory
  await rm(path.join(targetDir, '.roo'), { recursive: true, force: true });

  // Remove .roomodes file
  await rm(path.join(targetDir, '.roomodes'), { recursive: true, force: true });

  // Remove all .clinerules* files/directories
  const files = await readdir(targetDir);
  for (const file of files) {
    if (file.startsWith('.clinerules')) {
      const filePath = path.join(targetDir, file);
      const stats = await stat(filePath);
      if (stats.isFile()) {
        await rm(filePath, { force: true });
      } else if (stats.isDirectory()) {
        await rm(filePath, { recursive: true, force: true });
      }
    }
  }
}

async function copySet(setName) {
  const sourceDir = path.join(__dirname, '..', '..', '..', '.rools', setName);
  const targetDir = process.cwd();

  const entries = await readdir(sourceDir);
  for (const entry of entries) {
    const src = path.join(sourceDir, entry);
    const dest = path.join(targetDir, entry);
    const stats = await stat(src);
    if (stats.isDirectory()) {
      await cp(src, dest, { recursive: true });
    } else {
      await copyFile(src, dest);
    }
  }
}

async function main() {
  try {
    const sets = await listRoolsSets();
    if (sets.length === 0) {
      throw new Error('No rools sets found in .rools directory');
    }

    console.log('Available rools sets:');
    const selection = await promptSelection(sets);
    const chosenSet = sets[selection - 1];

    if (!chosenSet) {
      throw new Error('Invalid selection');
    }

    console.log(`Selected: ${chosenSet}`);
    await cleanTargetDir();
    await copySet(chosenSet);
    console.log(`Successfully deployed ${chosenSet} configuration`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();