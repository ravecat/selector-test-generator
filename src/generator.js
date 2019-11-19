const { resolve, join, dirname, basename, relative } = require('path');
const { readdir, lstatSync, readFile, writeFile, existsSync, mkdirSync } = require('fs');
const outdent = require('outdent');
const parser = require('@babel/parser');

// Probably generated content doesn't matches current formatting rules
function generateTestContent(selectors, fileName, path, statePath) {
  const defaultSelector = selectors.find(({ defaultImport }) => defaultImport);
  const namedSelectors = selectors.filter(({ defaultImport }) => !defaultImport);
  const relativePathToState = relative(path, statePath);
  const state = require(statePath).default || require(statePath).state;

  return outdent`
  ${
    namedSelectors.length
      ? `import { ${namedSelectors.map(({ name }) => name).join(', ')} } from '../${fileName}';`
      : ''
  }
  ${defaultSelector ? `import ${defaultSelector.name} from '../${fileName}';` : ''}
  import state from '${relativePathToState}';

  describe('Application/Selectors/${fileName}', () => {
  ${
    namedSelectors.length
      ? namedSelectors
          .map(({ name }) => {
            const { [name]: selector } = require(path);
            const expected = selector(state);

            return `
  it('${name}', () => {
    const received = ${name}(state);
    const expected = ${JSON.stringify(expected)};

    expect(received).toEqual(expected);
  });`;
          })
          .join('\n')
      : ''
  }
  ${
    defaultSelector
      ? `
  it('${defaultSelector.name}', () => {
    const received = ${defaultSelector.name}(state);
    const expected = ${
      typeof require(path).default(state) === 'string'
        ? `'${require(path).default(state)}'`
        : require(path).default(state)
    };

    expect(received).toEqual(expected);
  });`
      : ''
  }
  });\n
  `;
}

function generateTest(file, selectors, statePath) {
  const nodeDir = dirname(file);
  const testDir = resolve(nodeDir, '__test__');
  const testName = basename(file);
  const testFile = resolve(testDir, testName);

  if (!existsSync(testDir)) mkdirSync(testDir);
  const content = generateTestContent(selectors, testName, file, statePath);

  try {
    writeFile(testFile, content, err => {
      if (err) throw err;

      console.warn(`Test ${testFile} has been generated`);
    });
  } catch (e) {
    console.error(`Test ${testFile} generation error:`, e);
  }
}

function findSelectors(file, statePath) {
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
                  return {
                    ...acc,
                    untrusted: [...acc.untrusted, { name: declaration.name, defaultImport: true }],
                  };
                case 'CallExpression': {
                  const calleeName = declaration.callee.name;

                  return calleeName === 'createSelector'
                    ? {
                        ...acc,
                        selectors: [...acc.selectors, { name: calleeName, defaultImport: true }],
                      }
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
                      ? [...acc.selectors, { name: node.id.name }]
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
                      ? { ...acc, selectors: [...acc.selectors, { name: idName }] }
                      : acc;
                  }
                  default:
                    return acc;
                }
              }

              return {
                ...acc,
                untrusted: [
                  ...acc.untrusted,
                  ...specifiers.map(({ exported }) => ({
                    name: exported.name,
                  })),
                ],
              };
            }
            default:
              return acc;
          }
        },
        { selectors: [], untrusted: [] },
      );

      const { selectors, untrusted } = exportedNodes;
      const implicityImportedSelectors = untrusted.filter(({ name }) => availableSelectors[name]);
      const exportedSelectors = [...selectors, ...implicityImportedSelectors];

      console.warn('Available selectors:');
      console.warn(exportedSelectors);

      if (exportedSelectors.length) {
        generateTest(file, exportedSelectors, statePath);
      }
    } catch (e) {
      console.error('Getting selectors list error:', e);
    }
  });
}

function isDir(node) {
  return lstatSync(node).isDirectory();
}

function getNodes(selectorPath, statePath) {
  readdir(selectorPath, {}, (err, nodes) => {
    if (err) throw err;

    const allowableNodes = nodes.filter(node => {
      const path = join(selectorPath, node);
      const isJsFileOrDir = /.+\.js$/.test(node) || isDir(path);
      // Exclude nodes which match under one of the patterns below
      // __*__, *.test.js, .mock.js, *.mock, node_modules, dist
      const isAllowableNode = !/^__.*__$|(dist|node_modules|test\.js|\.mock|mock\.js)$/.test(node);

      return isJsFileOrDir && isAllowableNode;
    });

    for (let nodeIndex = allowableNodes.length - 1; nodeIndex >= 0; nodeIndex--) {
      const path = join(selectorPath, allowableNodes[nodeIndex]);

      if (isDir(path)) {
        getNodes(path, statePath);
      } else {
        findSelectors(path, statePath);
      }
    }
  });
}

export function generate(selectorDir, stateDir) {
  const executionPath = process.cwd();
  const selectorPath = resolve(executionPath, selectorDir);
  const statePath = resolve(executionPath, stateDir);

  getNodes(selectorPath, statePath);
}
