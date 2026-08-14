import { allFormConfigs } from "../src/lib/form-configs";
import fs from "fs";
import crypto from "crypto";

function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

function toPascalCase(str: string) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str: string) {
  return str
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
}

let prismaModels = "";

for (const config of allFormConfigs) {
  const modelName = toPascalCase("Form " + config.slug);
  const tableName = config.slug.replace(/-/g, "_");

  let modelStr = `model ${modelName} {\n`;
  modelStr += `  id        Int      @id @default(autoincrement())\n`;
  modelStr += `  userId    Int      @map("user_id")\n`;
  modelStr += `  createdAt DateTime @default(now()) @map("created_at")\n`;
  modelStr += `  updatedAt DateTime @updatedAt @map("updated_at")\n\n`;

  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === "section") continue;

      const fieldName = toCamelCase(field.name);
      
      let dbType = "String?";
      
      if (field.type === "date") dbType = "DateTime?";
      if (field.type === "checkbox") dbType = "Boolean @default(false)";
      if (field.type === "textarea") dbType = "String? @db.Text";
      
      if (field.type === "grid" && field.grid && field.grid.rows) {
        for (let i = 0; i < field.grid.rows.length; i++) {
          const rowField = toCamelCase(field.name + "_" + field.grid.rows[i]);
          let mapStr = "";
          let dbColName = toSnakeCase(rowField);
          if (dbColName.length > 60) {
            dbColName = dbColName.substring(0, 50) + "_" + crypto.createHash('md5').update(dbColName).digest('hex').substring(0, 5);
          }
          if (dbColName !== rowField) {
             mapStr = ` @map("${dbColName}")`;
          }
          
          modelStr += `  ${rowField.padEnd(20)} String?${mapStr}\n`;
        }
      } else {
        let mapStr = "";
        let dbColName = toSnakeCase(fieldName);
        if (dbColName.length > 60) {
          dbColName = dbColName.substring(0, 50) + "_" + crypto.createHash('md5').update(dbColName).digest('hex').substring(0, 5);
        }
        if (dbColName !== fieldName) {
           mapStr = ` @map("${dbColName}")`;
        }
        
        modelStr += `  ${fieldName.padEnd(20)} ${dbType}${mapStr}\n`;
      }
    }
  }

  modelStr += `\n  user User @relation(fields: [userId], references: [id])\n`;
  modelStr += `\n  @@map("form_${tableName}")\n`;
  modelStr += `}\n\n`;

  prismaModels += modelStr;
}

fs.writeFileSync("scratch/generated-models.prisma", prismaModels);
console.log("Successfully generated models to scratch/generated-models.prisma");
