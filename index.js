#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const yamljs = require('yamljs');
const argv = require('yargs')
    .option('path', { alias: 'p', default: process.cwd() })
    .option('template', { alias: 't', default: '.test/example.json' })
    .argv;

const rootDir = argv.p;
console.log('root dir', rootDir);

const template = path.join(rootDir, argv.template);
console.log('template', template);
const t = require(template);

glob(rootDir + '/**/*.yml', {}, (err, files) => {
    for (var i = 0; i < files.length; i++) {
        const yml = files[i];
        if (!yml.includes('node_modules') && !yml.includes('azure-pipelines')) {
            console.log('processing', yml);

            const dir = path.dirname(yml);
            const d = yamljs.load(yml);
            puff(t, dir, d);
        }
    }
});

async function puff(template, dir, data) {
    const defaultLayer = layer(data.default);

    Object.keys(data.environments).forEach(env => {
        const envLayer = merge(defaultLayer, layer(data.environments[env]));

        data.environments[env].regions.forEach(r => {
            const contents = template;
            const region = Object.keys(r)[0];
            const finalLayer = merge(envLayer, layer(r[region]));
            finalLayer.set('region', { value: region });

            contents.parameters = MapToObject(finalLayer);

            const fileName = path.join(dir, data.name + '.' + env + '.' + region + '.json');
            console.log('creating:', fileName);

            fs.writeFile(fileName
                , JSON.stringify(contents, null, 1)
                , {
                    flag: 'w+',
                    encoding: "utf8"
                }
                , write
            );
        });
    });
}

function MapToObject(m) {
    function selfIterator(map) {
        return Array.from(map).reduce((acc, [key, value]) => {
            if (value instanceof Map) {
                acc[key] = selfIterator(value);
            } else {
                acc[key] = value;
            }

            return acc;
        }, {})
    }

    return selfIterator(m);
}
function layer(data) {
    const map = new Map();

    Object.keys(data).forEach(element => {
        if ('regions' !== element) {
            map.set(element, { value: data[element] });
        }
    });

    return map;
}

function merge(a, b) {
    return new Map(function* () { yield* a; yield* b; }());
}

async function write(err, data) {
    if (err) {
        console.log(err);
    }
}