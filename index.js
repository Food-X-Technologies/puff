#!/usr/bin/env node
const fs = require('fs');
const yamljs = require('yamljs');
const argv = require('yargs')
            .option('yaml', {alias: 'y', default: './.test/example.yml'})
            .option('template', {alias: 't', default: './.test/example.json'})
            .argv;

const yml = argv.yaml;
console.log('processing', yml);
const template = argv.template;
console.log('template', template);

const t = require(template);
const d = yamljs.load(yml);
puff(t, d);

async function puff(template, data) {
    const defaultLayer = layer(data.default);

    Object.keys(data.environments).forEach(env => {
        const envLayer = merge(defaultLayer, layer(data.environments[env]));

        data.environments[env].regions.forEach(r => {
            const contents = template;
            const finalLayer = merge(envLayer, layer(r[Object.keys(r)[0]]));

            contents.parameters = MapToObject(finalLayer);
            const region = Object.keys(r)[0];

            const fileName = './' + data.name + '.' + env + '.' + region + '.json';
            console.log('creating:', fileName);

            fs.writeFile(fileName
                , JSON.stringify(contents)
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