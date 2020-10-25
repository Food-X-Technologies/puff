#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const deepmerge = require('deepmerge');
const yamljs = require('yamljs');
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

const rootDir = argv.p;
const template = {
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {}
};

glob(rootDir + '/**/*.yml', {}, (err, files) => {
    let count = 0;
    for (var i = 0; i < files.length; i++) {
        const yml = files[i];
        if (!yml.includes('node_modules') && !yml.includes('azure-pipelines')) {

            const dir = path.dirname(yml);
            const d = yamljs.load(yml);
            let name = path.parse(yml).name;
            console.log('processing', name);
            puff(del, template, dir, name, d);

            count++;
        }
    }

    console.log('processed:', count);
});

async function puff(del, template, dir, n, data) {
    let name = data.name || n;
    var base = remove(data.default || data, ['environments', 'services', 'name']);
    const environments = Environments(data.environments);
    environments.forEach((value, envKey) => {
        const done = deepmerge(base, value);
        Io(del, FileName(dir, name, envKey), template, done);
    });
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

function Environments(environments) {
    const envs = new Map();
    Object.keys(environments).forEach(env => {
        if (undefined !== environments[env].regions) {
            const data = remove(environments[env], ['regions']);
            environments[env].regions.forEach(reg => {
                const key = Object.keys(reg)[0];
                envs.set(`${env}.${key}`, deepmerge(data, deepmerge({ region: key }, reg[key])));
            });
        }
        else {
            const key = environments[env].region === undefined ? env : `${env}.${environments[env].region}`;
            envs.set(key, environments[env]);
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