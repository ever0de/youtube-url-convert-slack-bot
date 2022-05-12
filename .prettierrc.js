module.exports = {
  bracketSpacing: true,
  bracketSameLine: false,
  singleQuote: false,
  trailingComma: "all",
  semi: true,

  plugins: [require("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["<THIRD_PARTY_MODULES>", "@/(.*)$", "^[./](.*)$"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
