const chalk = require("chalk");
const ora = require("ora");

const { getDependenciesWithTypes } = require("./util");

const run = async (packageName) => {
  const spinner = ora({
    text: "Searching for types...",
    spinner: "growVertical",
  }).start();

  try {
    const types = await getDependenciesWithTypes(packageName);
    const noTypes = types.filter(({ hasTypes }) => !hasTypes);
    const hasNativeTypes = types.filter(
      ({ hasTypes }) => hasTypes === "native"
    );
    const hasDeclarations = types.filter(
      ({ hasTypes }) => hasTypes === "declarations"
    );

    spinner.stopAndPersist({
      symbol: "🌈",
      text: `Inspected ${chalk.bold(
        types.length
      )} dependencies of ${packageName}.`,
    });

    if (hasNativeTypes.length > 0) {
      console.log("");

      ora(
        `${chalk.bold(
          `${hasNativeTypes.length} modules`
        )} have native types available.`
      ).succeed();
    }

    if (noTypes.length > 0) {
      console.log("");

      const moduleNames = noTypes
        .map(({ packageName }) => packageName)
        .join(", ");

      ora(
        `${chalk.bold(
          `${noTypes.length} modules`
        )} do not have types available:\n\n  ${chalk.dim(moduleNames)}`
      ).fail();
    }

    if (hasDeclarations.length > 0) {
      console.log("");

      const moduleNames = hasDeclarations
        .map(({ packageName }) => `@types/${packageName}`)
        .join(" ");
      const npmCommand = `npm install --save-dev ${moduleNames}`;

      ora(
        `${chalk.bold(
          `${hasDeclarations.length} modules`
        )} have declarations available via a separate package. To add them to your project, run:\n\n  ${chalk.dim(
          npmCommand
        )}`
      ).info();
    }
  } catch (error) {
    spinner.fail(error.message);
  }
};

run(process.argv[2]);
