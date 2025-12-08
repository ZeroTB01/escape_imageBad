const chokidar = require("chokidar");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const clipboardy = require("clipboardy");

const config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

const watcher = chokidar.watch(config.watchPath, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

console.log("✅ 图床监听中:", config.watchPath);

function runGit() {
  exec("git add . && git commit -m \"auto upload\" && git push", (err) => {
    if (err) return console.log("❌ Git 推送失败");

    const files = fs.readdirSync(config.watchPath)
      .filter(f => !f.startsWith(".") && f !== "node_modules" && f !== "cdn.txt" && f !== "auto.js" && f !== "config.json");

    const cdnList = files.map(file => {
      return config.cdnPrefix + file;
    });

    const output = cdnList.join("\n");

    fs.writeFileSync(config.outputFile, output);

    clipboardy.writeSync(output);

    console.log("✅ CDN 链接已生成并复制到剪贴板");
  });
}

watcher.on("add", runGit);
watcher.on("change", runGit);
