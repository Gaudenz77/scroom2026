import { useEffect, useState } from "react"
import type { Room } from "../App"

// -----------------------------
// PURE HELPER OUTSIDE COMPONENT
// -----------------------------
function computeMinutes(now: number, startTime: number | null) {
  if (!startTime) return null
  const diffMs = now - startTime
  return Math.floor(diffMs / 60000)
}

type ScrRoomProps = {
  room: Room
  onSetActive: (roomId: string, visitorId: number) => void
  onRemove: (roomId: string, visitorId: number) => void
}

export default function ScrRoom({ room, onSetActive, onRemove }: ScrRoomProps) {

  // -----------------------------
  // TICKING CLOCK (PURE)
  // -----------------------------
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // -----------------------------
  // GROUP VISITORS
  // -----------------------------
  const activeVisitors = room.visitors.filter(v =>
    v.status === "waiting" || v.status === "active"
  )

  const overtimeVisitors = room.visitors.filter(v =>
    v.status === "warn" || v.status === "overtime"
  )

  // -----------------------------
  // COUNTERS
  // -----------------------------
  const W = activeVisitors.filter(v => v.status === "waiting").length
  const A = activeVisitors.filter(v => v.status === "active").length
  const UZ = overtimeVisitors.filter(v => v.status === "overtime").length
  const RT = A
  const TT = room.visitors.length

  const occupancyText =
    RT >= room.settings.maxClients
      ? "Raumbelegung: Voll"
      : `Raumbelegung: ${room.settings.maxClients - RT} freier Platz`

  // -----------------------------
  // COLOR LOGIC
  // -----------------------------
  const getRowColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-gray-100"
      case "active":
        return "bg-green-100"
      case "warn":
        return "bg-orange-100"
      case "overtime":
        return "bg-red-100"
    }
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="w-full h-full p-6 flex flex-col gap-4">

      <h1 className="text-2xl font-bold">
        Einlassregelung – {room.settings.name}
      </h1>

      <div className="flex gap-6 text-lg font-semibold">
        <div>W: {W}</div>
        <div>A: {A}</div>
        <div>ÜZ: {UZ}</div>
        <div>RT: {RT}</div>
        <div>TT: {TT}</div>
      </div>

      <div className="text-gray-700 font-medium">{occupancyText}</div>

      <div className="flex gap-6 flex-1">

        {/* LEFT */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-2">Warten / Aktiv</h2>

          <div className="grid grid-cols-5 font-semibold border-b pb-1 mb-2">
            <div>No</div>
            <div>Name</div>
            <div>Status</div>
            <div>Min</div>
            <div className="text-right">Aktion</div>
          </div>

          <div className="space-y-2">
            {activeVisitors.map(v => (
              <div
                key={v.id}
                className={`grid grid-cols-5 p-3 rounded-b-full rounded-t-full border items-center ${getRowColor(v.status)}`}
              >
                <div>{v.id}</div>
                <div>{v.name}</div>
                <div>{v.status === "waiting" ? "Warten" : "Aktiv"}</div>
                <div>{computeMinutes(now, v.startTime) ?? "-"}</div>

                <div className="flex justify-end gap-2">
                  {v.status === "waiting" && (
                    <button onClick={() => onSetActive(room.id, v.id)}>
                      <i className="fa-solid fa-arrow-right-to-bracket fa-2x"></i>
                    </button>
                  )}

                  <button onClick={() => onRemove(room.id, v.id)}>
                    <i className="fa-solid fa-arrow-right-from-bracket fa-2x"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-2">Überzeit</h2>

          <div className="grid grid-cols-4 font-semibold border-b pb-1 mb-2">
            <div>No</div>
            <div>Name</div>
            <div>Min</div>
            <div className="text-right">Aktion</div>
          </div>

          <div className="space-y-2">
            {overtimeVisitors.map(v => (
              <div
                key={v.id}
                className={`grid grid-cols-4 p-3 rounded-b-full rounded-t-full border items-center ${getRowColor(v.status)}`}
              >
                <div>{v.id}</div>
                <div>{v.name}</div>
                <div>{computeMinutes(now, v.startTime)}</div>

                <div className="flex justify-end">
                  <button onClick={() => onRemove(room.id, v.id)}>
                    <i className="fa-solid fa-arrow-right-from-bracket fa-2x"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  )
}
