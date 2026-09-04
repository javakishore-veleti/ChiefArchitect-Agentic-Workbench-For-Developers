#!/usr/bin/env node
import {loadConfig} from '../../shared/config/load-config.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((v,i,a)=>v.startsWith('--')?[v.slice(2),a[i+1]]:null).filter(Boolean));
const base = args.config;
const override = args['override-uri'] || process.env.GITHUB_ACTIONS_CONFIG_OVERRIDE_URI;
if (!base) throw new Error('Provide --config');
const config = await loadConfig(base,override);
const env = args.environment;
const mappings = config['configs-envs-mapping'].filter(x=>x.envs.includes(env));
if (mappings.length !== 1) throw new Error(`Environment must resolve to one config; found ${mappings.length}`);
const selected = config.configs.filter(x=>x['config-name']===mappings[0]['config-name']);
if (selected.length !== 1) throw new Error('Config mapping is missing or ambiguous');
const repos = selected[0].repositories.filter(x=>!args.repository || x.name===args.repository);
if (repos.length !== 1) throw new Error(`Repository must resolve uniquely; found ${repos.length}`);
if (args.workflow && !repos[0].workflows.includes(args.workflow)) throw new Error('Workflow is not configured for repository');
console.log(JSON.stringify({config:selected[0]['config-name'],organization:selected[0].organization,repository:repos[0].name,environment:env,workflow:args.workflow||null,settings:repos[0].environments?.[env]||{}},null,2));
