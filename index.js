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
console.log('root:', rootDir);

const template = path.join(rootDir, argv.template);
console.log('template:', template);
const t = require(template);
let generated = 0;

glob(rootDir + '/**/*.yml', {}, (err, files) => {
    let count = 0;
    for (var i = 0; i < files.length; i++) {
        const yml = files[i];
        if (!yml.includes('node_modules') && !yml.includes('azure-pipelines')) {
            console.log('processing', yml);

            const dir = path.dirname(yml);
            const d = yamljs.load(yml);
            puff(t, dir, d);

            count++;
        }
    }

    console.log('processed:', count, "generated:", generated);
});

async function puff(template, dir, data) {
    const defaultLayer = layer(data.default);

    Object.keys(data.environments).forEach(env => {
        const envLayer = merge(defaultLayer, layer(data.environments[env]));

        if (null != data.environments[env].region) {
            const region = data.environments[env].region;
            const finalLayer = envLayer;
            finalLayer.set('region', { value: region });

            const filename = path.join(dir, data.name + '.' + env + '.' + region + '.json');
            Write(template, finalLayer, filename);
        }
        else if (null != data.environments[env].regions && 0 < data.environments[env].regions.length)
        {
            data.environments[env].regions.forEach(r => {
                const region = Object.keys(r)[0];
                const finalLayer = merge(envLayer, layer(r[region]));
                finalLayer.set('region', { value: region });

                const filename = path.join(dir, data.name + '.' + env + '.' + region + '.json');
                Write(template, finalLayer, filename);
            });
        }
        else if (envLayer.has('region'))
        {
            const region = envLayer.get('region').value;
            const filename = path.join(dir, data.name + '.' + env + '.' + region + '.json');
            Write(template, envLayer, filename);
        }
        else
        {
            const filename = path.join(dir, data.name + '.' + env + '.json');
            Write(template, envLayer, filename);
        }
    });
}

async function Write(template, final, filename) {
    const contents = template;
    contents.parameters = MapToObject(final);

    fs.writeFile(filename
        , JSON.stringify(contents, null, 1)
        , {
            flag: 'w+',
            encoding: "utf8"
        }
        , write
    );

    console.log('created:', path.basename(filename));
    generated++;
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

    if (null != data) {
        const keys = Object.keys(data);
        if (0 < keys.length) {
            keys.forEach(element => {
                if ('regions' !== element) {
                    const val = (data[element].reference) ? data[element] : { value: data[element] };
                    
                    map.set(element, val );
                }
            });
        }
    }
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