import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

const eslintConfig = {
	files: ["**/*.js"],
	plugins: { js },
	extends: ["js/recommended"],
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		globals: globals.nodeBuiltin
	}
};

export default defineConfig([eslintConfig]);
