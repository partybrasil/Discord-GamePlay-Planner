import { useEffect, useState, useCallback } from 'react'
import * as Y from 'yjs'

export interface RoomState {
  isLocked: boolean
  hostId: string | null
  handRaiseQueue: string[]
  temporaryAccessList: string[]
}

export function useRoomState({ yDoc, userId }: { yDoc: Y.Doc, userId: string, userName?: string }) {
  const [state, setState] = useState<RoomState>({
    isLocked: false,
    hostId: null,
    handRaiseQueue: [],
    temporaryAccessList: []
  })

  // Get shared map
  const roomMap = yDoc.getMap<any>('room_state')
  const queueArray = yDoc.getArray<string>('hand_raise_queue')
  const accessArray = yDoc.getArray<string>('temp_access_list')

  // Sync state from Yjs
  useEffect(() => {
    const update = () => {
      setState({
        isLocked: roomMap.get('isLocked') || false,
        hostId: roomMap.get('hostId') || null,
        handRaiseQueue: queueArray.toArray(),
        temporaryAccessList: accessArray.toArray()
      })
    }
    
    roomMap.observe(update)
    queueArray.observe(update)
    accessArray.observe(update)
    update() // Initial

    return () => {
       roomMap.unobserve(update)
       queueArray.unobserve(update)
       accessArray.unobserve(update)
    }
  }, [yDoc, roomMap, queueArray, accessArray])

  // Logic: Claim Host if Empty
  useEffect(() => {
     if (userId && !roomMap.get('hostId')) {
        // Simple race implementation: try to set if empty
        // Yjs handles concurrency, last write wins usually, but for initialization:
        // Ideally checking if empty then setting.
        // We add a tiny random delay to reduce race if multiple start same time (though Yjs resolves it eventually).
        const timer = setTimeout(() => {
           if (!roomMap.get('hostId')) {
             yDoc.transact(() => {
               if(!roomMap.get('hostId')) roomMap.set('hostId', userId)
             })
           }
        }, Math.random() * 1000)
        return () => clearTimeout(timer)
     }
  }, [userId, roomMap, yDoc])


  // Actions
  const toggleLock = useCallback(() => {
     yDoc.transact(() => {
        const current = roomMap.get('isLocked')
        roomMap.set('isLocked', !current)
     })
  }, [roomMap, yDoc])

  const transferHost = useCallback((newHostId: string) => {
     roomMap.set('hostId', newHostId)
  }, [roomMap])

  const raiseHand = useCallback(() => {
     // Add self to queue if not present
     if (!queueArray.toArray().includes(userId)) {
        queueArray.push([userId])
     }
  }, [queueArray, userId])

  const lowerHand = useCallback((targetUserId: string) => {
      const idx = queueArray.toArray().indexOf(targetUserId)
      if (idx !== -1) {
         queueArray.delete(idx, 1)
      }
  }, [queueArray])

  const grantAccess = useCallback((targetUserId: string) => {
      if (!accessArray.toArray().includes(targetUserId)) {
          accessArray.push([targetUserId])
      }
      // Also remove from hand queue usually?
      lowerHand(targetUserId)
  }, [accessArray, lowerHand])

  const revokeAccess = useCallback((targetUserId: string) => {
      const idx = accessArray.toArray().indexOf(targetUserId)
      if (idx !== -1) {
          accessArray.delete(idx, 1)
      }
  }, [accessArray])

  const isHost = state.hostId === userId
  const canDraw = !state.isLocked || isHost || state.temporaryAccessList.includes(userId)

  return {
    ...state,
    isHost,
    canDraw,
    toggleLock,
    transferHost,
    raiseHand,
    lowerHand,
    grantAccess,
    revokeAccess
  }
}
