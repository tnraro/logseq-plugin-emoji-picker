module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", {
      npmPublish: false,
    }],
    "@semantic-release/git",
    ["@semantic-release/exec", {
      prepareCmd: "zip -qq -r logseq-plugin-emoji-picker-${nextRelease.version}.zip dist package.json"
    }],
    ["@semantic-release/github", {
      assets: "logseq-plugin-emoji-picker-*.zip",
    }]
  ]
};