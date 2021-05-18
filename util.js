const path = require("path");
const got = require("got");

const getDependenciesWithTypes = async (packageName, version) => {
  if (!packageName) {
    console.warn("\nPackage name missing, looking for local package.json");
  }

  const package = packageName
    ? await getPackageJson(packageName, version)
    : readPackageJson();

  if (!package) {
    throw new Error("Package not found");
  }

  const dependencyNames = Object.keys(package.dependencies);
  const typesForDependencies = await Promise.all(
    dependencyNames.map(async (packageName) => {
      const packageHasTypes = await hasTypes(packageName);

      return {
        packageName,
        hasTypes: packageHasTypes,
      };
    })
  );

  return typesForDependencies;
};

const getPackageJson = async (packageName, version) => {
  try {
    const { body } = await got(`https://registry.npmjs.org/${packageName}/`, {
      responseType: "json",
    });
    const tag = version === undefined ? body["dist-tags"].latest : version;
    const { dependencies, types } = body.versions[tag];

    return { dependencies, types };
  } catch (error) {
    return null;
  }
};

const readPackageJson = () => {
  try {
    const { dependencies, types } = require(path.join(
      process.cwd(),
      `./package.json`
    ));
    return { dependencies, types };
  } catch (error) {
    return null;
  }
};

const hasTypes = async (packageName, version) => {
  const package = await getPackageJson(packageName, version);

  if (!package) {
    return false;
  }

  if (package.types !== undefined) {
    return "native";
  }

  const typesPackage = await getPackageJson(`@types/${packageName}`);

  return typesPackage ? "declarations" : false;
};

module.exports = { getDependenciesWithTypes };
