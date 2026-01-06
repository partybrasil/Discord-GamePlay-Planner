import type { TLStore, TLRecord, HistoryEntry, TLInstancePresence } from 'tldraw'
import { transaction } from 'tldraw'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'

export function yStore({
	store,
	yDoc,
	provider,
	roomId,
}: {
	store: TLStore
	yDoc: Y.Doc
	provider: WebsocketProvider
	roomId: string
}) {
  const yMap = yDoc.getMap<TLRecord>(`tl_${roomId}_map`)
  const unsubs: (() => void)[] = []

  // --- Document Sync (Shapes, Assets, etc) ---

  // 1. Init from Yjs
  transaction(() => {
    store.clear()
    const records: TLRecord[] = []
    yMap.forEach((val) => {
      records.push(val)
    })
    store.put(records)
  })

  // 2. Listen for Yjs updates
  const handleYjsUpdate = (event: Y.YMapEvent<TLRecord>) => {
    transaction(() => {
       event.changes.keys.forEach((change, key) => {
           if (change.action === 'add' || change.action === 'update') {
             const record = yMap.get(key)
             if (record) store.put([record])
           } else if (change.action === 'delete') {
             store.remove([key as any])
           }
       })
    })
  }

  yMap.observe(handleYjsUpdate)
  unsubs.push(() => yMap.unobserve(handleYjsUpdate))

  // --- Presence Sync (Cursors) ---
  
  // 3. Listen for local presence changes and push to Awareness
  const handleLocalChange = (event: HistoryEntry<TLRecord>) => {
      // Filter for presence changes
      const presenceChanges = Object.values(event.changes.updated)
        .map(([_, r]) => r)
        .concat(Object.values(event.changes.added))
        .filter((r): r is TLInstancePresence => r.typeName === 'instance_presence')

      if (presenceChanges.length > 0) {
          // We only care about OUR presence
          presenceChanges.forEach(p => {
             provider.awareness.setLocalStateField('presence', p)
          })
      }
      
      // Also handle document changes (filtered above in previous implementation, but we need to do it here too)
      if (event.source !== 'user') return

      yDoc.transact(() => {
        const changes = event.changes
        // Added
        Object.values(changes.added).forEach(record => {
            if (record.typeName === 'instance_presence') return // Don't persist presence to Doc
            yMap.set(record.id, record)
        })
         // Updated
        Object.values(changes.updated).forEach(([_, record]) => {
             if (record.typeName === 'instance_presence') return
             yMap.set(record.id, record)
        })
        // Removed
        Object.values(changes.removed).forEach(record => {
             if (record.typeName === 'instance_presence') return
             yMap.delete(record.id)
        })
      })
  }
  
  const stopListeningStore = store.listen(handleLocalChange, { source: 'user', scope: 'all' })
  unsubs.push(stopListeningStore)

  // 4. Listen for Remote Awareness changes and update Store
  const handleAwarenessUpdate = (changes: { added: number[], updated: number[], removed: number[] }) => {
      transaction(() => {
         const states = provider.awareness.getStates()
         
         const toPut: TLRecord[] = []
         
         // Added or Updated
         ;[...changes.added, ...changes.updated].forEach(clientId => {
             const state = states.get(clientId)
             if (state?.presence) {
                 toPut.push(state.presence)
             }
         })

         // Removed? 
         // For now we don't explicitly remove 'stale' presence records from store, 
         // assuming Tldraw handles them or they are ephemeral.
         
         if (toPut.length > 0) store.put(toPut)
      })
  }

  provider.awareness.on('change', handleAwarenessUpdate)
  unsubs.push(() => provider.awareness.off('change', handleAwarenessUpdate))

  return () => {
    unsubs.forEach(fn => fn())
  }
}

