#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const deepmerge = require('deepmerge');
const yamljs = require('yamljs');
const { promisify } = require('util');
const argv = require('yargs')
    .option('path', { alias: 'p', default: process.cwd(), description: 'Root path for finding yml files to generate from.' })
    .option('delete', { alias: 'd', type: 'boolean', description: 'Delete files that were generated.' })
    .argv;

const del = argv.d;
if (del) {
    const puffin = `    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒████████░░░░░░░░░░░░░░░░
    ░░░░░░░░░░░░▒▒▒▒▒▒▒▒░░░░      ░░▓▓░░░░░░░░░░░░░░
    ░░░░░░░░▒▒▒▒▒▒▒▒░░░░░░            ██░░░░░░░░░░░░
    ░░░░░░▒▒▒▒▒▒▒▒░░  ░░░░            ░░▓▓░░░░░░░░░░
    ░░░░▒▒▒▒▒▒▒▒░░░░░░░░░░    ████      ████░░░░░░░░
    ░░▒▒▒▒▒▒▒▒░░░░░░░░░░░░    ████      ████░░░░░░░░
    ░░░░▒▒▒▒░░░░░░░░░░░░░░              ██████░░░░░░
    ░░░░▒▒▒▒▒▒░░░░░░░░░░░░              ██████░░░░░░
    ░░░░░░▒▒▒▒░░  ░░░░░░░░              ██████░░░░░░
    ░░░░░░░░▒▒░░░░░░░░░░                ████░░░░░░░░
    ░░░░░░░░░░▒▒▒▒░░░░                ██▓▓██░░░░░░░░
    ░░░░░░░░░░░░▒▒▒▒                ▒▒▓▓▓▓  ░░░░░░░░
    ░░░░░░░░░░░░  ▒▒              ▒▒██▒▒░░  ░░░░░░░░
    ░░░░░░░░░░░░▒▒▓▓░░▒▒        ▒▒▒▒██▓▓▒▒░░░░░░░░░░
    ░░░░░░░░░░▒▒██████▒▒░░░░░░░░▒▒▓▓▓▓▓▓▓▓▒▒░░░░░░░░
    ░░░░░░░░▒▒████▓▓██▒▒░░░░░░░░▒▒██████████▒▒░░░░░░
    ░░░░░░▒▒██▓▓██████▒▒░░░░░░░░▒▒████████████▒▒░░░░
    ░░░░▒▒▓▓██████████▒▒░░░░░░░░▒▒██▓▓████████▒▒░░░░
    ░░░░▒▒████████████▒▒░░░░░░░░▒▒████▓▓▓▓████▒▒░░░░
    ░░░░▒▒████████████▒▒░░░░░░░░▒▒▓▓██████████▒▒░░░░
    ░░░░▒▒████████████▒▒░░░░░░░░▒▒▓▓▓▓██▓▓██████▒▒░░
    ░░▒▒██████████████▒▒░░░░░░░░▒▒██▓▓██▓▓▓▓▓▓██▒▒░░
    ░░▒▒████████████▓▓▒▒░░░░░░░░▒▒██▓▓▓▓▓▓▓▓▓▓██▓▓▒▒
    ░░▒▒████████████▓▓▒▒        ▒▒▓▓▓▓████▓▓▓▓████▒▒
    ░░▒▒▓▓▓▓████████▒▒            ▒▒▓▓██▓▓▓▓▓▓████▒▒
    ░░░░▒▒▓▓██▓▓██▒▒                ▒▒████▓▓▓▓██▒▒░░
    ░░░░▒▒██████▒▒                    ▒▒██▓▓▓▓██▒▒░░
    ░░░░░░▒▒████                        ▒▒██▓▓▓▓▒▒░░
    ░░░░░░▒▒██▒▒                          ▒▒██▒▒░░░░
    ░░░░░░░░▒▒                              ▒▒░░░░░░
    ░░░░░░░░░░▒▒                          ▒▒░░░░░░░░
    ░░░░░░░░░░░░▒▒▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓▓▒▒░░░░░░░░░░
    ░░░░░░░░░░░░▓▓░░░░░░░░░░▓▓░░░░░░░░░░▓▓░░░░░░░░░░
    ░░░░░░░░░░░░▓▓░░░░░░░░░░▓▓░░░░░░░░░░▓▓░░░░░░░░░░
    ░░░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░
    ░░░░░░░░░░░░  ▓▓▓▓▓▓▓▓▓▓░░▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░`
    console.log(puffin);
    console.log('deleting generated files...');
}
else {
    const jelly = `
                                    ▒▒▒▒▒▒▒▒▒▒                                      
                                  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒                                    
                                ▒▒▒▒██▒▒▒▒▒▒██▒▒▒▒                                  
                                ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                                  
                                ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                                  
                                  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒                                    
                                  ▒▒  ▒▒  ▒▒  ▒▒                                    
                                ▒▒▒▒  ▒▒  ▒▒  ▒▒                                    
                                ▒▒  ▒▒  ▒▒  ▒▒  ▒▒                                  
                                ▒▒  ▒▒  ▒▒  ▒▒  ▒▒                                  
                                  ▒▒  ▒▒▒▒▒▒  ▒▒                                    
                                  ▒▒  ▒▒  ▒▒  ▒▒`
    console.log(jelly);
    console.log('generating files...');
}

const ignore = ['**/node_modules/**/*'];
const filepath = path.join(process.cwd(), '.puffignore');
let exist;


if(fs.existsSync(filepath)) {
    const puffIgnore = fs.readFileSync(filepath, { encoding: 'utf8' })
    lines = puffIgnore.match(/[^\r\n]+/g); 
    ignore.push(...lines.map(x => {
        const trimmed = x.trim();
        if(trimmed.startsWith("#") || !trimmed) return undefined;
        return trimmed;
    }).filter(x => x));
}

const rootDir = argv.p;
const template = {
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {}
};

glob('**/*.yml', { ignore, cwd: rootDir }, (err, files) => {
    let count = 0;
    for (var i = 0; i < files.length; i++) {
        const yml = files[i];
        const dir = path.dirname(yml);
        const d = yamljs.load(yml);
        let name = path.parse(yml).name;
        puff(del, template, dir, name, d);
        count++;
    }

    console.log('processed:', count);
});

async function puff(del, template, dir, n, data) {
    const indicator = del ? '-' : '+';
    const name = data.name || n;
    const base = remove(data.default || remove(data, ['name']), ['environments', 'services']);
    const environments = Environments(base, data.environments);
    const services = data.services === undefined ? new Map([[name, environments]]) : Services(name, base, environments, data.services);

    const output = new Map();
    services.forEach((sValue, sKey) => {
        output.set(sKey, MergeEnvs(environments, sValue));
    });

    output.forEach((sValue, sKey) => {
        sValue.forEach((eValue, eKey) => {
            const filename = FileName(dir, sKey, eKey);
            Io(del, filename, template, eValue).then(() => { console.log(`${indicator}${path.basename(filename)}`) });
        });
    });
}

function MergeEnvs(base, envs) {
    const merged = new Map();
    if (Map.prototype.toString.call(envs) === '[object Map]') {
        envs.forEach((eValue, eKey) => {
            const merge = base.has(eKey) ? deepmerge(base.get(eKey), eValue) : eValue;
            merged.set(eKey, merge);
        });

        base.forEach((eValue, eKey) => {
            if (!merged.has(eKey)) {
                merged.set(eKey, eValue);
            }
        });
    }
    else {
        base.forEach((eValue, eKey) => {
            if (!merged.has(eKey)) {
                merged.set(eKey, deepmerge(envs, eValue));
            }
        });
    }

    return merged;
}

function remove(obj, keys) {
    var target = {};
    for (var i in obj) {
        if (keys.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
        target[i] = obj[i];
    }

    return target;
}

function Services(name, base, environments, services) {
    const srvs = new Map();
    Object.keys(services).forEach(service => {
        const sBase = deepmerge(base, remove(services[service], ['environments']));
        if (undefined !== services[service].environments) {
            const envs = Environments(sBase, services[service].environments);
            const envMap = new Map();
            envs.forEach((value, envKey) => {
                const toAdd = environments.has(envKey) ? deepmerge(environments.get(envKey), value): value;
                envMap.set(envKey, deepmerge(sBase, toAdd));
            });
            srvs.set(`${name}${service}`, envMap);
        }
        else {
            srvs.set(`${name}${service}`, sBase);
        }
    });

    return srvs;
}

function Environments(base, environments) {
    const envs = new Map();
    Object.keys(environments).forEach(env => {
        if (undefined !== environments[env].regions) {
            const data = deepmerge(base, remove(environments[env], ['regions']));
            environments[env].regions.forEach(reg => {
                const key = Object.keys(reg)[0];
                let store = deepmerge(data, { region: key });
                if (reg[key]) store = deepmerge(store, reg[key]);
                envs.set(`${env}.${key}`, store);
            });
        }
        else {
            const key = environments[env].region ? `${env}.${environments[env].region}` : (base.region ? `${env}.${base.region}` : env);
            envs.set(key, deepmerge(base, environments[env]));
        }
    });

    return envs;
}

function FileName(dir, name, env) {
    return path.join(dir, `${name}.${env}.json`);
}

async function Io(del, filename, template, layer) {
    if (del) return await Delete(filename)
    else return await Write(template, layer, filename);
}

async function Delete(filename) {
    return await fs.unlink(filename, function (err) {
        if (err && err.code != 'ENOENT') return console.log(err);
    });
}

async function Write(template, final, filename) {
    const contents = template;
    contents.parameters = Fatten(final);

    return await fs.writeFile(filename
        , JSON.stringify(contents, null, 1)
        , {
            flag: 'w+',
            encoding: "utf8"
        }
        , function (err, data) {
            if (err) console.log(err);
        }
    );
}

function Fatten(obj) {
    Object.keys(obj).forEach(key => { if (obj[key].reference === undefined) obj[key] = { value: obj[key] }; });
    return obj;
}