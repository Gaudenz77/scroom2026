import { useState } from "react"
import type { Room, RoomSettings } from "../App"

type ScrSettingsProps = {
  room: Room
  onSave: (roomId: string, newSettings: RoomSettings) => void
  onBack: () => void
}

export default function ScrSettings({ room, onSave, onBack }: ScrSettingsProps) {

  const [name, setName] = useState(room.settings.name)
  const [maxStay, setMaxStay] = useState(room.settings.maxStay)
  const [maxClients, setMaxClients] = useState(room.settings.maxClients)
  const [warnTime, setWarnTime] = useState(room.settings.warnTime)

  const handleSave = () => {
    onSave(room.id, {
      name,
      maxStay,
      maxClients,
      warnTime
    })
    onBack()
  }

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6">

      <h1 className="text-2xl font-bold">
        Einstellungen – {room.settings.name}
      </h1>

      <div className="flex gap-10 flex-1">

        {/* LEFT: Settings form */}
        <div className="w-2/3 space-y-6">

          <h2 className="text-xl font-bold">Einstellungen</h2>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Name des Raumes</label>
            <input
              className="border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Maximale Nutzungsdauer (Minuten)</label>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={maxStay}
              onChange={(e) => setMaxStay(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Maximale Anzahl der Personen</label>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={maxClients}
              onChange={(e) => setMaxClients(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Warnzeit</label>
            <input
              type="number"
              className="border rounded px-3 py-2"
              value={warnTime}
              onChange={(e) => setWarnTime(Number(e.target.value))}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Abbrechen
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Speichern
            </button>
          </div>
        </div>

        {/* RIGHT: Legend */}
        <div className="w-1/3">
          <h2 className="text-xl font-bold mb-3">Legende</h2>

          <div className="space-y-2 text-gray-700">
            <div><strong>W:</strong> Warten</div>
            <div><strong>A:</strong> Aktiv</div>
            <div><strong>ÜZ:</strong> Über Zeit</div>
            <div><strong>RT:</strong> Raum Total</div>
            <div><strong>TT:</strong> Tages Total</div>
          </div>
        </div>

      </div>
    </div>
  )
}
