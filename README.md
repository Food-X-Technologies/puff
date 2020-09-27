# Introduction 
Convert yaml into Azure ARM parameters templates (json).

## Node
```
node ./index.js -t ./template.json
```

## NPM
```
  "scripts": {
    "puff": "puff",
    "puffin": "puff -d"
}
```
### Generate
```
$ npm run puff
```

#### Delete
```
$ npm run puffin
```

# Examples
## Input (yaml)
```
name: example
default:
    key1: value1default
    key2: value2default
environments:
  one:
    key3: value2one
    regions:
    - abc:
        key1: value1abc
  two:
    key4: value4two
    region: xyz
```

## Outputs (json)
### 1. example.one.abc.json
```
{
 "parameters": {
  "key1": {
   "value": "value1abc"
  },
  "key2": {
   "value": "value2default"
  },
  "key3": {
   "value": "value2one"
  },
  "region": {
   "value": "abc"
  }
 }
}
```
### 2. example.two.xyz.json
```
{
 "parameters": {
  "key1": {
   "value": "value1default"
  },
  "key2": {
   "value": "value2default"
  },
  "key4": {
   "value": "value4two"
  },
  "region": {
   "value": "xyz"
  }
 }
}
```