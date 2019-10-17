module.exports = {
  // Set a required branch value for debugging mode
  branch: 'master',
  tagFormat: '${version}',
  preset: 'angular',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [{ type: 'docs', release: 'patch' }],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts: {
          referenceActions: ['META'],
        },
        writerOpts: {
          commitsSort: ['subject', 'scope'],
        },
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message: 'build(release): ${nextRelease.version}[skip ci]\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/gitlab',
  ],
};
