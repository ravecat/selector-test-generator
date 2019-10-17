const { resolve, join } = require('path');
const { readdir, readdirSync, lstatSync, readFile, readFileSync } = require('fs');
const program = require('commander');
const parser = require('@babel/parser');

let selectorsDir;
let statePath;

program
  .arguments('[dir]')
  .option('-s, --state <state>')
  .action((_, cmdObj) => {
    if (typeof cmdObj.state === 'undefined') {
      console.error("Error: mocked state isn't specified");
      process.exit(1);
    }

    statePath = cmdObj.state;
  })
  .action(dir => {
    if (typeof dir === 'undefined') {
      console.warn('No specify selector directory, use current path', process.cwd());
    }

    selectorsDir = dir || process.cwd();
  })
  .parse(process.argv);

function isDir(node) {
  return lstatSync(node).isDirectory();
}

function generateTest(file) {
  readFile(file, (err, data) => {
    console.warn('Parse file', file);

    if (err) throw err;

    try {
      const parsed = parser.parse(data.toString(), {
        sourceType: 'module',
      });
      const parsedNodes = parsed.program.body.filter(({ type }) =>
        ['ExportNamedDeclaration', 'VariableDeclaration', 'ExportDefaultDeclaration'].includes(
          type,
        ),
      );

      // Selectors which exist but not explicitly exported
      const availableSelectors = parsedNodes.reduce(
        (
          acc,
          { declarations: [{ id: { name } = {}, init: { type, callee } = {} }] = [{}] } = {},
        ) => {
          const isSelector = type === 'CallExpression' && callee.name === 'createSelector';

          return isSelector ? { ...acc, [name]: true } : acc;
        },
        {},
      );

      const exportedNodes = parsedNodes.reduce(
        (acc, { type, declaration, specifiers }) => {
          switch (type) {
            case 'ExportDefaultDeclaration': {
              switch (declaration.type) {
                case 'Identifier':
                  return { ...acc, untrusted: [...acc.untrusted, declaration.name] };
                case 'CallExpression': {
                  const calleeName = declaration.callee.name;

                  return calleeName === 'createSelector'
                    ? { ...acc, selectors: [...acc.selectors, calleeName] }
                    : acc;
                }
                default:
                  return acc;
              }
            }
            case 'ExportNamedDeclaration': {
              if (declaration) {
                const { declarations: [node] = [{}] } = declaration;

                switch (node.init.type) {
                  case 'Identifier': {
                    const selectors = availableSelectors[node.init.name]
                      ? [...acc.selectors, node.id.name]
                      : [...acc.selectors];

                    return {
                      ...acc,
                      selectors,
                    };
                  }
                  case 'CallExpression': {
                    const calleeName = node.init.callee.name;
                    const idName = node.id.name;

                    return calleeName === 'createSelector'
                      ? { ...acc, selectors: [...acc.selectors, idName] }
                      : acc;
                  }
                  default:
                    return acc;
                }
              }

              return {
                ...acc,
                untrusted: [...acc.untrusted, ...specifiers.map(({ exported }) => exported.name)],
              };
            }
            default:
              return acc;
          }
        },
        { selectors: [], untrusted: [] },
      );

      const { selectors, untrusted } = exportedNodes;
      const implicityImportedSelectors = untrusted.filter(node => availableSelectors[node]);
      const exportedSelectors = [...selectors, ...implicityImportedSelectors];

      console.warn('Available selectors:');
      console.warn(exportedSelectors);

      const testDir = `${dirPath}/__test__/`;
      const testFile = `${testDirPath}index.test.js`;

    } catch (e) {
      console.error('Test generation error:', e);
    }
  });
}

function getNodes(source) {
  readdir(source, {}, (err, nodes) => {
    if (err) throw err;

    const allowableNodes = nodes.filter(node => {
      const path = join(source, node);
      const isJsFileOrDir = /.+\.js$/.test(node) || isDir(path);
      // Exclude nodes which match under one of the patterns below
      // __*__, *.test.js, .mock.js, *.mock, node_modules, dist
      const isAllowableNode = !/^__.*__$|(dist|node_modules|test\.js|\.mock|mock\.js)$/.test(node);

      return isJsFileOrDir && isAllowableNode;
    });

    for (let nodeIndex = allowableNodes.length - 1; nodeIndex > 0; nodeIndex--) {
      const path = join(source, allowableNodes[nodeIndex]);

      if (isDir(path)) {
        getNodes(path);
      } else {
        generateTest(path);
      }
    }
  });
}

function generate(relativePath) {
  const executionPath = process.cwd();
  const selectorPath = resolve(executionPath, relativePath);

  getNodes(selectorPath);
}

generate(selectorsDir);
