# Introduction 
Convert yaml into Azure ARM parameters templates (json). Checkout the [examples](https://github.com/Food-X-Technologies/puff-example).

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

## .puffignore
A file named .puffignore on the execution folder can provide a list of patterns to be ignored.

```
# ignore all files inside the ignore folder (including nested folders)
ignore/**/*

# ignore all files that matches the pattern (including nested folders)
**/*-old

# ignore specic file
folder/file.yml
```

Comments must always start at the beggining of the line `ignore.yml # won't work` 

Negative pattern are not allowed `!(ignore/**/dont-ignore.yml)` won't create an exeption to a previous ignore rule like .gitignore does.

# Examples
## [Input (yaml)](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/example.yml)
## Outputs (json)
### 1. [ex-service1.one.abc.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.one.abc.json)
### 2. [ex-service1.two.xyz.json](https://github.com/Food-X-Technologies/puff-example/blob/main/example-simple/ex-service1.two.xyz.json)