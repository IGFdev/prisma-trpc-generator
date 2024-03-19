"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onGenerate = void 0;
const node_fs_1 = require("node:fs");
const prettier_1 = require("prettier");
const utils_1 = require("./utils");
function onGenerate(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        let exportedTypes = "";
        const dataModel = options.dmmf.datamodel;
        // Convert Prisma models to TypeScript interfaces
        for (const model of dataModel.models) {
            exportedTypes += `export interface ${model.name} {\n`;
            // Only convert fields with kind "scalar" and "enum"
            const scalarAndEnumFields = model.fields.filter((field) => ["scalar", "enum"].includes(field.kind));
            for (const field of scalarAndEnumFields) {
                // A utility function to convert Prisma types to TypeScript types
                // We'll create this function later.
                const typeScriptType = (0, utils_1.getTypeScriptType)(field.type);
                // Whether the field should be optional
                const nullability = field.isRequired ? "" : "| null";
                // Whether the field should be an array
                const list = field.isList ? "[]" : "";
                exportedTypes += `${field.name}: ${typeScriptType}${nullability}${list};\n`;
            }
            exportedTypes += "}\n\n";
        }
        // Convert Prisma enums to TypeScript types (Prisma object enums).
        // See below how to use TypeScript "enum"s instead.
        for (const enumType of dataModel.enums) {
            exportedTypes += `export const ${enumType.name} = {`;
            for (const enumValue of enumType.values) {
                exportedTypes += `${enumValue.name}: "${enumValue.name}",\n`;
            }
            exportedTypes += "} as const;\n";
            exportedTypes += `export type ${enumType.name} = (typeof ${enumType.name})[keyof typeof ${enumType.name}];\n\n`;
        }
        // Write the generated types to a file
        const outputDir = (_b = (_a = options.generator.output) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "./types";
        const fullLocaltion = `${outputDir}/index.ts`;
        // Make sure the output directory exists, if not create it
        (0, node_fs_1.mkdirSync)(outputDir, { recursive: true });
        // Format the generated code
        const formattedCode = yield (0, prettier_1.format)(exportedTypes, {
            // ... your preferred prettier options
            parser: "typescript",
        });
        // Write the formatted code to a file
        (0, node_fs_1.writeFileSync)(fullLocaltion, formattedCode);
    });
}
exports.onGenerate = onGenerate;
