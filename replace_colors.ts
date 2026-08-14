import * as fs from "fs";
import * as path from "path";

function walk(dir: string, callback: (filepath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = "C:\\Users\\mhafi\\Desktop\\form-ppi\\src";

walk(targetDir, (filepath) => {
  if (filepath.endsWith(".tsx")) {
    let content = fs.readFileSync(filepath, "utf8");
    let changed = false;

    // Replace cyan with green
    const newContent1 = content.replace(/cyan-/g, "green-");
    if (newContent1 !== content) {
      content = newContent1;
      changed = true;
    }

    // Replace blue with emerald
    const newContent2 = content.replace(/blue-/g, "emerald-");
    if (newContent2 !== content) {
      content = newContent2;
      changed = true;
    }

    // Replace indigo with teal
    const newContent3 = content.replace(/indigo-/g, "teal-");
    if (newContent3 !== content) {
      content = newContent3;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filepath, content, "utf8");
      console.log(`Updated colors in ${filepath}`);
    }
  }
});
