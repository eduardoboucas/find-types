const got = require("got");

const getDependenciesWithTypes = async (packageName, version) => {
  if (!packageName) {
    throw new Error("Package name missing");
  }

  const package = await getPackageJson(packageName, version);

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
