import { Tldraw, useEditor, createShapeId, AssetRecordType } from 'tldraw'
import type { TLStoreWithStatus } from 'tldraw'
import 'tldraw/tldraw.css'
import { useCallback } from 'react'

const RPG_ICONS = [
  { icon: '🛡️', name: 'Tank', type: 'text' },
  { icon: '➕', name: 'Healer', type: 'text' },
  { icon: '⚔️', name: 'DPS', type: 'text' },
  { icon: '💀', name: 'Boss', type: 'text' },
  { icon: '🚩', name: 'Rally', type: 'text' },
]

function CustomToolbar() {
	const editor = useEditor()

	const addIcon = (icon: string) => {
		const id = createShapeId()
		editor.createShape({
			id,
			type: 'text',
			x: editor.getViewportScreenCenter().x,
			y: editor.getViewportScreenCenter().y,
			props: {
				text: icon,
				scale: 4, // Make em big
			},
		})
	}

  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
       const src = event.target?.result as string
       const assetId = AssetRecordType.createId()
       const shapeId = createShapeId()
       
       // Create asset
       editor.createAssets([{
         id: assetId,
         typeName: 'asset',
         type: 'image',
         props: {
           w: 1920, // Default placeholders, tldraw usually detects size but for simplicity
           h: 1080,
           name: file.name,
           isAnimated: false,
           mimeType: file.type,
           src: src,
         },
         meta: {},
       }])

       // Create image shape
       editor.createShape({
         id: shapeId,
         type: 'image',
         x: 0, 
         y: 0,
         props: {
           assetId,
           w: 1920,
           h: 1080,
         },
         isLocked: true // Lock it as background
       })
       
       // Send to back
       editor.sendToBack([shapeId])
    }
    reader.readAsDataURL(file)
  }, [editor])

	return (
		<div style={{ pointerEvents: 'all', display: 'flex', gap: 8 }} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-xl z-50">
      <div className="flex gap-2 border-r border-zinc-600 pr-2 mr-2">
         <label className="cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded flex flex-col items-center justify-center text-xs w-16 text-center" title="Upload Map">
            <span className="text-xl">🗺️</span>
            <span>Map</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
         </label>
      </div>

			{RPG_ICONS.map((item) => (
				<button
					key={item.name}
					className="hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded flex flex-col items-center justify-center text-xs w-12"
					onClick={() => addIcon(item.icon)}
          title={`Add ${item.name}`}
				>
          <span className="text-xl">{item.icon}</span>
          <span className="opacity-70">{item.name}</span>
				</button>
			))}
		</div>
	)
}

export default function Whiteboard({ store }: { store: TLStoreWithStatus['store'] }) {
  if (!store) return <div className="text-white text-center mt-20">Loading Board...</div>

	return (
		<div className="w-full h-full relative" style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
			<Tldraw store={store} hideUi={false}>
          <CustomToolbar />
      </Tldraw>
		</div>
	)
}



