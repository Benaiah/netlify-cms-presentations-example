const copy = require("recursive-copy");
const del = require("del");
const exec = require("mz/child_process").exec;
const fs = require("mz/fs");
const Handlebars = require("handlebars");
const path = require("path");

// Reads the site settings
const readConfig = configPath =>
  fs.readFile(configPath).then(text => JSON.parse(text)).catch(err => {
    if (err.code === "ENOENT") {
      return {};
    }
    throw err;
  });

// Removes and recreates a directory
const cleanDirectory = dir => {
  if (dir !== "" && dir !== "." && dir !== "/" && dir !== "..") {
    return del([`./${dir}/**`]).then(() => fs.mkdir(`./${dir}`));
  }
  throw new Error("Bad directory name.");
};

const copyOptions = { overwrite: true };
const copyAssets = () =>
  copy("./static", "./dist", copyOptions)
    // Notifications of copy progress
    .on(copy.events.COPY_FILE_START, copyOperation =>
      console.info(`Copying file ${copyOperation.src} ...`)
    )
    .on(copy.events.COPY_FILE_COMPLETE, copyOperation =>
      console.info(`Copied to ${copyOperation.dest}`)
    )
    .on(copy.events.ERROR, (error, copyOperation) =>
      console.error(`Unable to copy to ${copyOperation.dest}`)
    )
    // Notify of success or failure
    .then(results => console.info(`${results.length} file(s) copied`))
    .catch(err => console.error(`Copy failed: ${err}`));

const getPresentations = () =>
  fs
    .readdir("./presentations")
    .then(files => files.filter(file => path.parse(file).ext === ".md"));

const createPresentation = (presentationPath, dest) =>
  cleanDirectory(dest).then(() =>
    exec(`./node_modules/.bin/reveal-md ${presentationPath} --static ${dest}`)
  );

const createPresentations = () =>
  getPresentations().then(files =>
    Promise.all(
      files.map(file => {
        const slug = path.parse(file).name;
        console.log(`Creating presentation ${slug} ...`);
        return createPresentation(
          `./presentations/${file}`,
          `./dist/presentations/${slug}`
        ).then(() => {
          console.log(`Created presentation ${slug}`);
          return slug;
        });
      })
    )
  );

const getIndexPageTemplate = () =>
  fs
    .readFile("index.handlebars", "utf8")
    .then(contents => Handlebars.compile(contents));

const createIndexPage = data =>
  getIndexPageTemplate()
    .then(template => template(data))
    .then(page => fs.writeFile("./dist/index.html", page, "utf8"));

const build = config =>
  cleanDirectory("dist")
    .then(copyAssets)
    .then(() => cleanDirectory("dist/presentations"))
    .then(createPresentations)
    .then(slugs =>
      createIndexPage({
        config,
        presentations: slugs.map(slug => ({ slug, title: slug }))
      })
    );

readConfig("./config.json").then(build).catch(err => console.error(err));
