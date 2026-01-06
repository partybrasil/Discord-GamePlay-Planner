import { useEffect, useState, useMemo } from 'react'
import { createTLStore, defaultShapeUtils } from 'tldraw'
import type { TLStoreWithStatus } from 'tldraw'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { yStore } from './yStore'

export function useYjsStore({
	roomId = 'discord-planner-room',
	hostUrl = 'ws://localhost:1234',
	shapeUtils = [],
}: {
	roomId?: string
	hostUrl?: string
	shapeUtils?: any[]
}) {
	const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
		status: 'loading',
	})

	const { yDoc, provider } = useMemo(() => {
    if (!roomId) return { yDoc: {} as any, provider: {} as any }
		const yDoc = new Y.Doc()
		const provider = new WebsocketProvider(hostUrl, roomId, yDoc, { connect: true })
		return {
			yDoc,
			provider,
		}
	}, [hostUrl, roomId])

	useEffect(() => {
    if (!roomId || !yDoc || !provider || !provider.awareness) return

		setStoreWithStatus({ status: 'loading' })

		const store = createTLStore({
			shapeUtils: [...defaultShapeUtils, ...shapeUtils],
		})

    const cleanup = yStore({ store, yDoc, provider, roomId })

		setStoreWithStatus({ status: 'synced-remote', connectionStatus: 'online', store })

		return () => {
			cleanup()
      provider.disconnect()
		}
	}, [yDoc, provider, roomId, shapeUtils])

	return { ...storeWithStatus, provider, yDoc }
}
