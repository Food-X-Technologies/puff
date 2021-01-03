# Introduction 
Convert yaml into Azure ARM parameters templates (json). Checkout our [examples](https://github.com/Food-X-Technologies/puff-example).

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
## Outputs (json)
### 1. [ex-service1.one.abc.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.one.abc.json)
### 2. [ex-service1.two.xyz.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.two.xyz.json)