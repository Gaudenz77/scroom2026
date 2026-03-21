import { useState } from "react"
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
  const [view, setView] = useState<"room" | "settings">("room")
  const [selectedRoomId, setSelectedRoomId] = useState("roomA")

  // FIXED: lazy initializer to allow Date.now()
  const [rooms, setRooms] = useState<Room[]>(() => [
    {
      id: "roomA",
      settings: {
        name: "Raucherraum",
        maxStay: 3,
        warnTime: 2,
        maxClients: 3
      },
      visitors: [
        { id: 5, name: "4", status: "waiting", startTime: null },
        { id: 3, name: "Jimmy", status: "active", startTime: Date.now() - 103 * 60000 },
        { id: 6, name: "jan", status: "active", startTime: Date.now() - 93 * 60000 },
        { id: 1, name: "John", status: "overtime", startTime: Date.now() - 2614 * 60000 },
        { id: 2, name: "Jane", status: "warn", startTime: Date.now() - 2610 * 60000 }
      ]
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
  ])

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)!

  function updateRoomSettings(roomId: string, newSettings: RoomSettings) {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, settings: newSettings }
          : room
      )
    )
  }

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

/*
import { useState } from "react"
import ScrRoom from "./components/ScrRoom"
import ScrSettings from "./components/ScrSettings"
import TopBar from "./components/TopBar"

export default function App() {
  const [view, setView] = useState<"room" | "settings">("room")

  const [rooms] = useState([
    { id: "roomA", name: "Raucherraum" },
    { id: "roomB", name: "IV-Raum" }
  ])

  const [selectedRoomId, setSelectedRoomId] = useState("roomA")

  return (
    <div className="w-full h-full flex flex-col">

      <TopBar
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        onOpenSettings={() => setView("settings")}
      />

      <div className="flex-1">
        {view === "room" && (
          <ScrRoom roomId={selectedRoomId} />
        )}

        {view === "settings" && (
          <ScrSettings
            roomId={selectedRoomId}
            onBack={() => setView("room")}
          />
        )}
      </div>

    </div>
  )
}


/* 
import ScrRoom from "./components/ScrRoom"
import ScrSettings from "./components/ScrSettings"

export default function App() {
  const [view, setView] = useState<"room" | "settings">("room")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  return (
    <div className="w-full h-full">
      {view === "room" && (
        <ScrRoom
          onOpenSettings={(roomId) => {
            setSelectedRoomId(roomId)
            setView("settings")
          }}
        />
      )}

      {view === "settings" && (
        <ScrSettings
          roomId={selectedRoomId}
          onBack={() => setView("room")}
        />
      )}
    </div>
  )
}
*/
