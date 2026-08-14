import { PrismaClient } from '@prisma/client'
import { allFormConfigs } from '../src/lib/form-configs'

const prisma = new PrismaClient()

function toCamelCase(str: string) {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
}

async function main() {
  console.log('Starting to clear dummy data from all form tables...')

  for (const config of allFormConfigs) {
    const slug = config.slug;
    const modelName = toCamelCase("form-" + slug);

    try {
      // @ts-ignore
      const model = prisma[modelName];
      if (model) {
        const result = await model.deleteMany({});
        console.log(`Cleared ${result.count} records from ${modelName}`);
      }
    } catch (e) {
      console.error(`Error clearing ${modelName}:`, e);
    }
  }

  // Also clear the old generic FormSubmission table if there's anything left
  try {
    const result = await prisma.formSubmission.deleteMany({});
    console.log(`Cleared ${result.count} records from old formSubmission`);
  } catch (e) {
    // Ignore if not exists
  }

  console.log('Finished clearing database!');
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
