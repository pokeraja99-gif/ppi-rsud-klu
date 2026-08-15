const fs = require('fs');

const prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const blocks = prismaSchema.split('model ').slice(1);
let drizzleSchema = `import { mysqlTable, serial, varchar, text, boolean, datetime, int, json } from "drizzle-orm/mysql-core";\n\n`;

for (const block of blocks) {
  const lines = block.split('\n');
  const modelName = lines[0].trim().replace(/\{$/, '').trim();
  
  let tableName = modelName.toLowerCase();
  const mapMatch = block.match(/@@map\("(.+?)"\)/);
  if (mapMatch) {
    tableName = mapMatch[1];
  }

  drizzleSchema += `export const ${modelName} = mysqlTable("${tableName}", {\n`;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
    if (trimmed === '}') break;

    // e.g. "id Int @id @default(autoincrement())"
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;

    const fieldName = parts[0];
    const fieldType = parts[1];
    
    // ignore relations (usually uppercase or PascalCase type)
    if (fieldType.match(/^[A-Z]/) && !['String', 'Int', 'Boolean', 'DateTime', 'Json', 'Float'].includes(fieldType.replace('?', ''))) continue;

    let mapName = fieldName;
    const fieldMapMatch = trimmed.match(/@map\("(.+?)"\)/);
    if (fieldMapMatch) {
      mapName = fieldMapMatch[1];
    }

    let drizzleType = '';
    const isOptional = fieldType.includes('?');
    const baseType = fieldType.replace('?', '');

    if (baseType === 'Int') {
      if (trimmed.includes('@id')) {
        drizzleType = `serial("${mapName}").primaryKey()`;
      } else {
        drizzleType = `int("${mapName}")`;
      }
    } else if (baseType === 'String') {
      if (trimmed.includes('@db.Text')) {
        drizzleType = `text("${mapName}")`;
      } else {
        drizzleType = `varchar("${mapName}", { length: 255 })`;
      }
    } else if (baseType === 'Boolean') {
      drizzleType = `boolean("${mapName}")`;
      if (trimmed.includes('@default(true)')) drizzleType += `.default(true)`;
      if (trimmed.includes('@default(false)')) drizzleType += `.default(false)`;
    } else if (baseType === 'DateTime') {
      drizzleType = `datetime("${mapName}")`;
    } else if (baseType === 'Json') {
      drizzleType = `json("${mapName}")`;
    } else if (baseType === 'Float') {
      drizzleType = `int("${mapName}")`; // quick fallback for this schema
    }

    if (drizzleType) {
      if (!isOptional && !trimmed.includes('@id') && !trimmed.includes('@default')) {
        drizzleType += `.notNull()`;
      }
      drizzleSchema += `  ${fieldName}: ${drizzleType},\n`;
    }
  }

  drizzleSchema += `});\n\n`;
}

fs.writeFileSync('src/db/schema.ts', drizzleSchema);
console.log('Schema generated!');
