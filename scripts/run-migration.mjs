// Supabase REST API арқылы миграция іске асыру скрипті
// Іске қосу: node scripts/run-migration.mjs

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local оқу
const env = readFileSync(join(__dirname, '../.env.local'), 'utf8')
const envVars = {}
for (const line of env.split('\n')) {
  const [key, ...val] = line.split('=')
  if (key && !key.startsWith('#')) envVars[key.trim()] = val.join('=').trim()
}

const SUPABASE_URL        = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY    = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL немесе SUPABASE_SERVICE_ROLE_KEY табылмады')
  process.exit(1)
}

const sql = readFileSync(join(__dirname, '../supabase/migrations/002_functions.sql'), 'utf8')

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
  method: 'POST',
  headers: {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'apikey':        SERVICE_ROLE_KEY,
    'Prefer':        'return=representation',
  },
  body: JSON.stringify({ query: sql }),
})

if (!res.ok) {
  // Fallback: try pg-meta endpoint
  const res2 = await fetch(`${SUPABASE_URL.replace('.supabase.co', '')}/pg-meta/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey':        SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (!res2.ok) {
    console.log('ℹ️  Автоматты миграция мүмкін емес.')
    console.log('📋 Supabase Dashboard → SQL Editor-ге кіріп, төмендегі SQL-ді іске асырыңыз:')
    console.log('\n' + sql)
    process.exit(0)
  }
}

console.log('✅ Миграция сәтті орындалды!')
