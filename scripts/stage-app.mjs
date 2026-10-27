// Stages one store app into store/dist/<id>/www with the same repo-relative layout the apps expect,
// plus capacitor.config.json. Usage: node scripts/stage-app.mjs <app-id|all>
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'store/apps.json'), 'utf8'));
const skip = new Set(['_shots', '_test', 'node_modules', '.git', 'tools', 'test']);
const want = process.argv[2] || 'all';
for (const app of cfg.apps) {
  if (want !== 'all' && want !== app.id) continue;
  const out = join(root, 'store/dist', app.id), www = join(out, 'www');
  rmSync(out, { recursive: true, force: true }); mkdirSync(www, { recursive: true });
  for (const d of [app.dir, ...app.extra]) {
    const src = join(root, d); if (!existsSync(src)) { console.error('missing', d); process.exit(1); }
    cpSync(src, join(www, d), { recursive: true, filter: s => !skip.has(s.split('/').pop()) });
  }
  const icons = join(root, 'brand/apps');
  mkdirSync(join(out, 'resources'), { recursive: true });
  for (const f of [`${app.id}-1024.png`, `${app.id}-maskable-512.png`]) cpSync(join(icons, f), join(out, 'resources', f));
  writeFileSync(join(www, 'index.html'), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${app.start}"><script>location.replace("${app.start}"+location.search)</script>`);
  writeFileSync(join(out, 'capacitor.config.json'), JSON.stringify({
    appId: app.bundleId, appName: app.name, webDir: 'www',
    server: { androidScheme: 'https', iosScheme: 'https' },
    ios: { contentInset: 'always' }, android: { allowMixedContent: false, adjustMarginsForEdgeToEdge: 'force' }
  }, null, 2));
  writeFileSync(join(out, 'package.json'), JSON.stringify({
    name: app.id, private: true, version: '0.1.0',
    scripts: { 'add:ios': 'cap add ios', 'add:android': 'cap add android', sync: 'cap sync', 'assets': 'capacitor-assets generate' },
    dependencies: { '@capacitor/core': '7.4.3', '@capacitor/ios': '7.4.3', '@capacitor/android': '7.4.3' },
    devDependencies: { '@capacitor/cli': '7.4.3', '@capacitor/assets': '3.0.5' }
  }, null, 2));
  console.log('staged', app.id, '->', out);
}
