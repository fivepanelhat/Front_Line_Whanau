import 'server-only';
import { MemorySaver } from '@langchain/langgraph';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Pool } from 'pg';
import { agentLogger } from '@/lib/logger';

const log = agentLogger('Checkpointer');

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://user:password@localhost:5432/whanau_agents';

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const postgresCheckpointer = new PostgresSaver(pool);
let didSetup = false;

export async function createPostgresCheckpointer() {
  if (!didSetup) {
    await postgresCheckpointer.setup();
    didSetup = true;
  }

  return postgresCheckpointer;
}

export async function createCheckpointSaver() {
  try {
    return await createPostgresCheckpointer();
  } catch (error) {
    log.warn({ err: error }, 'Postgres checkpointer unavailable, using MemorySaver fallback.');
    return new MemorySaver();
  }
}
