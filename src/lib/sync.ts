import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'
import { supabase } from './supabase'

export type SyncAction = {
  table: string
  action: 'insert' | 'update' | 'delete'
  payload: any
  matchKey?: string
  matchValue?: string
}

type SyncListener = (info: { userId: string; pendingCount: number; lastSyncedAt?: string }) => void
const syncListeners = new Set<SyncListener>()

/**
 * Optional schema-evolution columns that may lag on an unmigrated Supabase instance.
 * Only these non-financial metadata columns may be stripped on 42703/PGRST204 retry
 * so core amounts/directions/dates are never silently dropped.
 */
const OPTIONAL_SCHEMA_COLUMNS: Record<string, Set<string>> = {
  loan_agreements: new Set([
    'agreement_category',
    'relationship',
    'penalty_amount',
    'penalty_type',
    'penalty_rate',
    'penalty_grace_days',
  ]),
  loan_payments: new Set(['penalty_component']),
}

function extractMissingColumn(table: string, error: unknown): string | null {
  const errObj = error as { code?: string; message?: string } | null
  if (!errObj) return null
  const code = String(errObj.code || '')
  const msg = String(errObj.message || '')
  if (code !== '42703' && code !== 'PGRST204' && !/column .* does not exist|Could not find the .* column/i.test(msg)) {
    return null
  }

  // Postgres: column loan_agreements.agreement_category does not exist
  const pgMatch = msg.match(/column\s+(?:[a-z0-9_]+\.)?([a-z0-9_]+)\s+does not exist/i)
  if (pgMatch?.[1]) {
    const col = pgMatch[1].toLowerCase()
    if (OPTIONAL_SCHEMA_COLUMNS[table]?.has(col)) return col
  }

  // PostgREST schema cache: Could not find the 'agreement_category' column of 'loan_agreements'
  const pgrstMatch = msg.match(/Could not find the ['"]([a-z0-9_]+)['"] column/i)
  if (pgrstMatch?.[1]) {
    const col = pgrstMatch[1].toLowerCase()
    if (OPTIONAL_SCHEMA_COLUMNS[table]?.has(col)) return col
  }

  return null
}

async function executeSyncAction(userId: string, item: SyncAction): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  let payload = item.payload && typeof item.payload === 'object' ? { ...item.payload } : item.payload
  const maxRetries = 6

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let error: any = null

    if (item.action === 'insert') {
      const res = await supabase.from(item.table).insert(payload)
      error = res.error
    } else if (item.action === 'update' && item.matchKey) {
      if (payload && typeof payload === 'object' && Object.keys(payload).length === 0) {
        return
      }
      let query = supabase.from(item.table).update(payload).eq(item.matchKey, item.matchValue)
      if (item.table !== 'users') query = query.eq('user_id', userId)
      const res = await query
      error = res.error
    } else if (item.action === 'delete' && item.matchKey) {
      let query = supabase.from(item.table).delete().eq(item.matchKey, item.matchValue)
      if (item.table !== 'users') query = query.eq('user_id', userId)
      const res = await query
      error = res.error
    }

    if (!error) return

    const missingCol = extractMissingColumn(item.table, error)
    if (missingCol && payload && typeof payload === 'object' && missingCol in payload) {
      console.warn(`[Sync] Retrying ${item.action} on ${item.table} without unmigrated column '${missingCol}'`)
      delete payload[missingCol]
      continue
    }

    throw error
  }
}

export function subscribeSyncStatus(listener: SyncListener) {
  syncListeners.add(listener)
  return () => {
    syncListeners.delete(listener)
  }
}

async function emitSyncStatus(userId: string, pendingCount: number, lastSyncedAt?: string) {
  for (const listener of syncListeners) {
    try {
      listener({ userId, pendingCount, lastSyncedAt })
    } catch {
      // ignore subscriber errors
    }
  }
}

export async function readSyncQueue(userId: string): Promise<SyncAction[]> {
  try {
    const queueStr = await AsyncStorage.getItem(`@syncQueue_${userId}`)
    if (!queueStr) return []
    const parsed = JSON.parse(queueStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function getSyncQueueCount(userId: string): Promise<number> {
  const queue = await readSyncQueue(userId)
  return queue.length
}

export async function getLastSyncedAt(userId: string): Promise<string | undefined> {
  try {
    const value = await AsyncStorage.getItem(`@syncLastAt_${userId}`)
    return value || undefined
  } catch {
    return undefined
  }
}

export async function recordSyncedTimestamp(userId: string, pendingCount = 0) {
  const now = new Date().toISOString()
  try {
    await AsyncStorage.setItem(`@syncLastAt_${userId}`, now)
  } catch {
    // ignore storage errors
  }
  await emitSyncStatus(userId, pendingCount, now)
  return now
}

export async function pushMutation(
  userId: string,
  table: string,
  action: 'insert' | 'update' | 'delete',
  payload: any,
  matchKey?: string,
  matchValue?: string,
) {
  if (!supabase) return
  try {
    await executeSyncAction(userId, { table, action, payload, matchKey, matchValue })
    const remaining = await getSyncQueueCount(userId)
    await recordSyncedTimestamp(userId, remaining)
  } catch (err) {
    console.warn(`[Sync] Mutation failed, queuing ${action} on ${table}`, err)
    const queue = await readSyncQueue(userId)
    queue.push({ table, action, payload, matchKey, matchValue })
    await AsyncStorage.setItem(`@syncQueue_${userId}`, JSON.stringify(queue))
    const last = await getLastSyncedAt(userId)
    await emitSyncStatus(userId, queue.length, last)
  }
}

let isSyncing = false
export async function processSyncQueue(userId: string): Promise<{ processed: number; remaining: number }> {
  if (isSyncing || !supabase) {
    const remaining = await getSyncQueueCount(userId)
    return { processed: 0, remaining }
  }
  isSyncing = true

  try {
    const queue = await readSyncQueue(userId)
    if (queue.length === 0) {
      await emitSyncStatus(userId, 0, await getLastSyncedAt(userId))
      return { processed: 0, remaining: 0 }
    }

    console.log(`[Sync] Processing ${queue.length} queued mutations...`)
    const remainingQueue: SyncAction[] = []
    let processed = 0

    for (const item of queue) {
      try {
        await executeSyncAction(userId, item)
        processed++
      } catch (err) {
        console.warn(`[Sync] Failed to process queued item on ${item.table}, keeping in queue`, err)
        remainingQueue.push(item)
      }
    }

    await AsyncStorage.setItem(`@syncQueue_${userId}`, JSON.stringify(remainingQueue))
    if (processed > 0 || remainingQueue.length === 0) {
      await recordSyncedTimestamp(userId, remainingQueue.length)
    } else {
      await emitSyncStatus(userId, remainingQueue.length, await getLastSyncedAt(userId))
    }
    return { processed, remaining: remainingQueue.length }
  } finally {
    isSyncing = false
  }
}

export function startNetworkListener(userId: string) {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void processSyncQueue(userId)
    }
  })
}
