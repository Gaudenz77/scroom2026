import { useEffect, useState } from "react"
import type { Room } from "../App"

// -----------------------------
// PURE HELPERS OUTSIDE COMPONENT
// -----------------------------
function computeMinutes(now: number, startTime: number | null) {
  if (!startTime) return null
  const diffMs = now - startTime
  return Math.floor(diffMs / 60000)
}

function formatMinSec(minutes: number | null, now: number, startTime: number | null) {
    if (startTime == null) return "-"
  
    const diffMs = now - startTime
    const totalSeconds = Math.floor(diffMs / 1000)
  
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
  
    return `${m}:${s.toString().padStart(2, "0")}`
  }
  

function deriveStatus(
  baseStatus: string,
  minutes: number | null,
  warnTime: number,
  maxStay: number
): "waiting" | "active" | "warn" | "overtime" {
  if (baseStatus === "waiting") return "waiting"
  if (minutes == null) return "active"

  if (minutes >= maxStay) return "overtime"
  if (minutes >= warnTime) return "warn"
  return "active"
}

type ScrRoomProps = {
  room: Room
  onSetActive: (roomId: string, visitorId: number) => void
  onRemove: (roomId: string, visitorId: number) => void
  onAddVisitor: (roomId: string, name: string) => void
}

export default function ScrRoom({ room, onSetActive, onRemove, onAddVisitor }: ScrRoomProps) {

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
  // CHECK-IN INPUT
  // -----------------------------
  const [newName, setNewName] = useState("")

  // -----------------------------
  // ENRICH VISITORS WITH MINUTES + EFFECTIVE STATUS
  // -----------------------------
  const visitors = room.visitors.map(v => {
    const minutes = computeMinutes(now, v.startTime)
    const effectiveStatus = deriveStatus(
      v.status,
      minutes,
      room.settings.warnTime,
      room.settings.maxStay
    )

    return {
      ...v,
      minutes,
      effectiveStatus
    }
  })

  // -----------------------------
  // GROUP VISITORS
  // -----------------------------
  const activeVisitors = visitors.filter(v =>
    v.effectiveStatus === "waiting" || v.effectiveStatus === "active"
  )

  const overtimeVisitors = visitors.filter(v =>
    v.effectiveStatus === "warn" || v.effectiveStatus === "overtime"
  )

  // -----------------------------
  // COUNTERS
  // -----------------------------
  const W = visitors.filter(v => v.effectiveStatus === "waiting").length
  const A = visitors.filter(v => v.effectiveStatus === "active").length
  const UZ = visitors.filter(v => v.effectiveStatus === "overtime").length
  const RT = A
  const TT = visitors.length

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

      {/* Title */}
      <h1 className="text-2xl font-bold">
        Einlassregelung – {room.settings.name}
      </h1>

      {/* Counters */}
      <div className="flex gap-6 text-lg font-semibold">
        <div>W: {W}</div>
        <div>A: {A}</div>
        <div>ÜZ: {UZ}</div>
        <div>RT: {RT}</div>
        <div>TT: {TT}</div>
      </div>

      {/* Occupancy */}
      <div className="text-gray-700 font-medium">{occupancyText}</div>

      {/* Check-In */}
      <div className="flex gap-3 items-center mb-4">
        <input
          type="text"
          placeholder="Name eingeben..."
          className="border rounded px-3 py-2 flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => {
            if (newName.trim().length === 0) return
            onAddVisitor(room.id, newName.trim())
            setNewName("")
          }}
        >
          Check-In
        </button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 flex-1">

        {/* LEFT: Warten / Aktiv */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-2">Warten / Aktiv</h2>

          {/* Header row */}
          <div className="grid grid-cols-5 font-semibold border-b pb-1 mb-2">
            <div>No</div>
            <div>Name</div>
            <div>Status</div>
            <div>Min</div>
            <div className="text-right">Aktion</div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {activeVisitors.map(v => (
              <div
                key={v.id}
                className={`grid grid-cols-5 p-3 rounded-b-full rounded-t-full border items-center ${getRowColor(v.effectiveStatus)}`}
              >
                <div>{v.id}</div>
                <div>{v.name}</div>
                <div>
                  {v.effectiveStatus === "waiting" && "Warten"}
                  {v.effectiveStatus === "active" && "Aktiv"}
                </div>
                <div>{formatMinSec(v.minutes, now, v.startTime)}</div>


                <div className="flex justify-end gap-2">
                  {v.effectiveStatus === "waiting" && (
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

        {/* RIGHT: Überzeit */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-2">Überzeit</h2>

          {/* Header row */}
          <div className="grid grid-cols-4 font-semibold border-b pb-1 mb-2">
            <div>No</div>
            <div>Name</div>
            <div>Min</div>
            <div className="text-right">Aktion</div>
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {overtimeVisitors.map(v => (
              <div
                key={v.id}
                className={`grid grid-cols-4 p-3 rounded-b-full rounded-t-full border items-center ${getRowColor(v.effectiveStatus)}`}
              >
                <div>{v.id}</div>
                <div>{v.name}</div>
                <div>{v.minutes}</div>

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
