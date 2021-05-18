# find-types

Are you considering converting your JavaScript project to TypeScript and you're wondering how many of your dependencies will have types available? This is for you.

![Screenshot](https://user-images.githubusercontent.com/4162329/118693581-157f2980-b803-11eb-9cda-3a417791816e.png)

## Usage

```bash
npx find-types <name of your package>
```

## How it works

1. `find-types` scans your package's dependencies.
2. For each dependency, it checks whether a `types` field exists in `package.json`.
3. If one doesn't exist, it also looks for a `@types/` package.
