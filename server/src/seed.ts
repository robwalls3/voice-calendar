import { db } from './db'
import { subjects } from './schema'

await db.insert(subjects).values([
  { name: 'daisy', type: 'pet' },
  { name: 'rob', type: 'person' },
  { name: 'meredith', type: 'person' },
  { name: 'house', type: 'place' },
]).onConflictDoNothing()

console.log('Seeded subjects ✓')
process.exit(0)