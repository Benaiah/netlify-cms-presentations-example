const copy = require("recursive-copy");
const del = require("del");
const exec = require("mz/child_process").exec;
const spawn = require("mz/child_process").spawn;
const fs = require("mz/fs");
const Handlebars = require("handlebars");
const path = require("path");

const runScript = (script, args = []) =>
  new Promise((resolve, reject) => {
    console.log("ARGS", args);
    spawn("npm", ["run", script, "--"].concat(args), { stdio: "inherit" }).on(
      "close",
      code => (code === 0 ? resolve(code) : reject(code))
    );
  });

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

// Copies static folder to dist
const copyOptions = { overwrite: true };
const copyStatic = () =>
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
    // Notification of success or failure
    .then(results => console.info(`${results.length} file(s) copied`))
    .catch(err => console.error(`Copy failed: ${err}`));

const compileJS = () => runScript("compile-js");

// Gets a list of the presentation files
const getPresentations = () =>
  fs
    .readdir("./presentations")
    .then(files => files.filter(file => path.parse(file).ext === ".md"));

// Calls reveal-md to create the presentations
const createPresentation = (presentationPath, dest) =>
  runScript("compile-presentation", ["--static", dest, presentationPath]);

// Creates the presentations concurrently
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

// Reads and compiles the index.handlebars file into a template
const getIndexPageTemplate = () =>
  fs
    .readFile("./src/index.handlebars", "utf8")
    .then(contents => Handlebars.compile(contents));

const createIndexPage = data =>
  getIndexPageTemplate()
    .then(template => template(data))
    .then(page => {
      console.log(page);
      return page;
    })
    .then(page => fs.writeFile("./dist/index.html", page, "utf8"));

const build = config =>
  cleanDirectory("dist")
    .then(copyStatic)
    .then(compileJS)
    .then(() => cleanDirectory("dist/presentations"))
    .then(createPresentations)
    .then(slugs => {
      console.log(slugs);
      return createIndexPage({
        config,
        presentations: slugs.map(slug => ({ slug, title: slug }))
      });
    });

readConfig("./config.json")
  .then(build)
  .then(console.log)
  .catch(err => console.error(err));
