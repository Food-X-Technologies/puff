# Introduction 
Convert yaml into Azure ARM parameters templates (json). Checkout out our [examples](https://github.com/Food-X-Technologies/puff-example).

## Node
```
node ./index.js
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
## [Input (yaml)](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/example.yml)
```
name: ex-
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
services:
  service1:
    regions:
    - abc:
      key2: value2xyz
```

## Outputs (json)
### 1. [ex-service1.one.abc.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.one.abc.json)
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
### 2. [ex-service1.two.xyz.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.two.xyz.json)
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