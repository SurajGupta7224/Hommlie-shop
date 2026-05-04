const fs = require('fs');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('./src');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.match(/import React, \{\s*/)) {
    content = content.replace(/import React, \{\s*/g, "import { ");
    changed = true;
  }
  if (content.match(/import React from ['"]react['"];?\r?\n?/)) {
    content = content.replace(/import React from ['"]react['"];?\r?\n?/g, "");
    changed = true;
  }
  if (file.endsWith('CartContext.tsx')) {
    content = content.replace(/import \{ createContext, useContext, useState, useCallback, ReactNode \} from 'react';/, "import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';");
    // Also handle the case where it was already replaced
    content = content.replace(/import \{ createContext, useContext, useState, useCallback, ReactNode \}/, "import { createContext, useContext, useState, useCallback, type ReactNode }");
    changed = true;
  }
  if (file.endsWith('AppImage.tsx')) {
    content = content.replace(/position: 'absolute',/, "position: 'absolute' as const,");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
}
console.log('Fixed errors');
