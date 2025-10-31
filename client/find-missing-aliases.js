// client/find-missing-aliases.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "src");

const aliasesInConfig = {
  "@": "src",
  "@components": "src/components",
  "@contexts": "src/contexts",
  "@pages": "src/pages",
  "@hooks": "src/hooks",
  "@ui": "src/components/ui",
  "@shared": "../shared",
  "@lib": "lib",
};

function findAtImports(dir) {
  const imports = new Set();
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findAtImports(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts") || fullPath.endsWith(".jsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const matches = content.match(/from ["'](@[^"']+)["']/g) || [];
      matches.forEach(match => {
        const importPath = match.split(/from ["']/)[1].slice(0, -1);
        imports.add(importPath.split("/")[0]); // e.g., "@ui"
      });
    }
  }

  return imports;
}

const usedAliases = findAtImports(srcDir);
const missing = [...usedAliases].filter(alias => !aliasesInConfig[alias]);

if (missing.length === 0) {
  console.log("All @aliases are configured!");
} else {
  console.log("Missing aliases in vite.config.ts:");
  missing.forEach(alias => {
    const guess = guessPath(alias);
    console.log(`  "${alias}": path.resolve(__dirname, "${guess}"),`);
  });
}

function guessPath(alias) {
  const withoutAt = alias.slice(1); // "ui" from "@ui"
  if (withoutAt === "components") return "src/components";
  if (withoutAt === "pages") return "src/pages";
  if (withoutAt === "contexts") return "src/contexts";
  if (withoutAt === "hooks") return "src/hooks";
  if (withoutAt === "ui") return "src/components/ui";
  if (withoutAt === "lib") return "lib";
  if (withoutAt === "shared") return "../shared";
  return `src/${withoutAt}`;
}