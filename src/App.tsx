import { useState, useEffect } from "react"
import ScrRoom from "./components/ScrRoom"
import ScrSettings from "./components/ScrSettings"
import TopBar from "./components/TopBar"

// TYPES
export type VisitorStatus =
  | "waiting"
  | "active"
  | "warn"
  | "overtime"

export type Visitor = {
  id: number
  name: string
  status: VisitorStatus
  startTime: number | null
}

export type RoomSettings = {
  name: string
  maxStay: number
  warnTime: number
  maxClients: number
}

export type Room = {
  id: string
  settings: RoomSettings
  visitors: Visitor[]
}

export default function App() {

  const STORAGE_KEY = "scrroom_rooms_v1"

  const [view, setView] = useState<"room" | "settings">("room")
  const [selectedRoomId, setSelectedRoomId] = useState("roomA")

  // ---------------------------------------------------------
  // LOAD ROOMS (lazy initializer) — with daily reset
  // ---------------------------------------------------------
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved)
      const today = new Date().toDateString()

      // If saved data is from today → restore it
      if (parsed.date === today) {
        return parsed.rooms
      }
    }

    // Otherwise start fresh
    return [
      {
        id: "roomA",
        settings: {
          name: "Raucherraum",
          maxStay: 3,
          warnTime: 2,
          maxClients: 3
        },
        visitors: []   // start empty each day
      },
      {
        id: "roomB",
        settings: {
          name: "IV-Raum",
          maxStay: 3,
          warnTime: 2,
          maxClients: 3
        },
        visitors: []
      }
    ]
  })

  // ---------------------------------------------------------
  // SAVE ROOMS TO LOCALSTORAGE WHENEVER THEY CHANGE
  // ---------------------------------------------------------
  useEffect(() => {
    const today = new Date().toDateString()
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: today, rooms })
    )
  }, [rooms])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)!

  // ---------------------------------------------------------
  // UPDATE SETTINGS
  // ---------------------------------------------------------
  function updateRoomSettings(roomId: string, newSettings: RoomSettings) {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, settings: newSettings }
          : room
      )
    )
  }

  // ---------------------------------------------------------
  // VISITOR HANDLERS
  // ---------------------------------------------------------
  function setVisitorActive(roomId: string, visitorId: number) {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room

        return {
          ...room,
          visitors: room.visitors.map(v =>
            v.id === visitorId
              ? { ...v, status: "active", startTime: Date.now() }
              : v
          )
        }
      })
    )
  }

  function removeVisitor(roomId: string, visitorId: number) {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room

        return {
          ...room,
          visitors: room.visitors.filter(v => v.id !== visitorId)
        }
      })
    )
  }

  function addVisitor(roomId: string, name: string) {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room

        const nextId =
          room.visitors.length === 0
            ? 1
            : Math.max(...room.visitors.map(v => v.id)) + 1

        const newVisitor = {
          id: nextId,
          name,
          status: "waiting" as const,
          startTime: null
        }

        return {
          ...room,
          visitors: [...room.visitors, newVisitor]
        }
      })
    )
  }

  function clearVisitors(roomId: string) {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, visitors: [] }
          : room
      )
    )
  }
  

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className="w-full h-full flex flex-col">

      <TopBar
        rooms={rooms.map(r => ({ id: r.id, name: r.settings.name }))}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        onOpenSettings={() => setView("settings")}
      />

      <div className="flex-1">
        {view === "room" && (
          <ScrRoom
            room={selectedRoom}
            onSetActive={setVisitorActive}
            onRemove={removeVisitor}
            onAddVisitor={addVisitor}
            onClearVisitors={clearVisitors}
          />
        )}

        {view === "settings" && (
          <ScrSettings
            room={selectedRoom}
            onSave={updateRoomSettings}
            onBack={() => setView("room")}
          />
        )}
      </div>

    </div>
  )
}