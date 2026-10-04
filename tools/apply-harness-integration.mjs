/** Explicit, guarded source integration. Default is check-only; never touches DSH_HOME. */
import {readFileSync,existsSync,cpSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=resolve(process.argv[2]??'');
if (!process.argv[2]) throw new Error('Usage: node tools/apply-harness-integration.mjs <Harness checkout> [--apply]');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
if (pkg.name !== '@deepseek-ai/dsh-root' || !existsSync(join(root,'packages/client/ui-conversation'))) throw new Error('Expected the Harness source checkout');
const here=fileURLToPath(new URL('../',import.meta.url));
const patch=join(here,'harness-integration/arcade-ui.patch');
function git(args){const r=spawnSync('git',args,{cwd:root,encoding:'utf8'});if(r.status!==0)throw new Error(r.stderr||r.stdout);return r.stdout;}
git(['apply','--check',patch]);
console.log('Source patch applies. Existing sessions/configuration are outside the write scope.');
if(!process.argv.includes('--apply')) {console.log('Check only. Add --apply to integrate.');process.exit(0);}
const backup=join(root,'.tmp-design','arcade-backup-'+Date.now());mkdirSync(backup,{recursive:true});
const text=readFileSync(patch,'utf8');
const paths=[...text.matchAll(/^diff --git a\/(.+) b\/(.+)$/gm)].map(m=>m[1]);
for(const rel of paths){const src=resolve(root,rel);if(!src.startsWith(root+ (process.platform==='win32'?'\\':'/')))throw new Error('Unsafe patch path');if(existsSync(src))cpSync(src,join(backup,rel),{recursive:true});}
writeFileSync(join(backup,'files.json'),JSON.stringify(paths,null,2));
git(['apply',patch]);
for(const dir of ['whale-workbench','vendor'])cpSync(join(here,'assets',dir),join(root,'apps/web/public/assets',dir),{recursive:true});
cpSync(join(here,'assets/fonts'),join(root,'apps/web/public/fonts'),{recursive:true});
console.log('Applied frontend source and local assets. Backup: '+backup);
console.log('Build affected client packages and frontend before restarting your Web service.');
