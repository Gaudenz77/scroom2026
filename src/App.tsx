import { useState, useEffect } from "react"
import ScrRoom from "./components/ScrRoom"
import ScrSettings from "./components/ScrSettings"
import TopBar from "./components/TopBar"
import Swal from "sweetalert2"
import { supabase } from "./supabaseClient"   // ← ADDED

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
  dailyTotal: number
}

export default function App() {

  const [view, setView] = useState<"room" | "settings">("room")
  const [selectedRoomId, setSelectedRoomId] = useState("roomA")

  // ---------------------------------------------------------
  // LOAD ROOMS + VISITORS FROM SUPABASE
  // ---------------------------------------------------------
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    const loadData = async () => {
      const { data: roomsData } = await supabase.from("rooms").select("*")
      const { data: visitorsData } = await supabase.from("visitors").select("*")

      if (!roomsData) return

      const merged: Room[] = roomsData.map(room => ({
        id: room.id,
        settings: {
          name: room.name,
          maxStay: room.maxStay,
          warnTime: room.warnTime,
          maxClients: room.maxClients
        },
        visitors: visitorsData
          ? visitorsData
              .filter(v => v.roomId === room.id)
              .map(v => ({
                id: v.id,
                name: v.name,
                status: v.status,
                startTime: v.startTime
              }))
          : [],
        dailyTotal: room.dailyTotal
      }))

      setRooms(merged)
    }

    loadData()
  }, [])

  if (rooms.length === 0) {
    return <div className="p-4 text-white">Loading…</div>
  }

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)!

  // ---------------------------------------------------------
  // UPDATE SETTINGS (LOCAL ONLY FOR NOW)
  // ---------------------------------------------------------
  /*
  function updateRoomSettings(roomId: string, newSettings: RoomSettings) {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, settings: newSettings }
          : room
      )
    )
  }
  */
  async function updateRoomSettings(roomId: string, newSettings: RoomSettings) {
    // 1) Update Supabase
    const { error } = await supabase
      .from("rooms")
      .update({
        name: newSettings.name,
        maxStay: newSettings.maxStay,
        warnTime: newSettings.warnTime,
        maxClients: newSettings.maxClients
      })
      .eq("id", roomId)
  
    if (error) {
      console.error("Settings update error:", error)
      return
    }
  
    // 2) Update local state
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, settings: newSettings }
          : room
      )
    )
  }
  
  // ---------------------------------------------------------
  // VISITOR HANDLERS (LOCAL ONLY FOR NOW)
  // ---------------------------------------------------------
  /*
  function setVisitorActive(roomId: string, visitorId: number) {
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room

        const activeCount = room.visitors.filter(v => v.status === "active").length

        if (activeCount >= room.settings.maxClients) {
          Swal.fire({
            icon: "warning",
            title: "Raum voll",
            text: "Es sind keine freien Plätze verfügbar.",
            confirmButtonText: "OK"
          })
          return room
        }

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
  */
  async function setVisitorActive(roomId: string, visitorId: number) {
    // 1) Local update (instant UI)
    setRooms(prev =>
      prev.map(room => {
        if (room.id !== roomId) return room
  
        const activeCount = room.visitors.filter(v => v.status === "active").length
  
        if (activeCount >= room.settings.maxClients) {
          Swal.fire({
            icon: "warning",
            title: "Raum voll",
            text: "Es sind keine freien Plätze verfügbar.",
            confirmButtonText: "OK"
          })
          return room
        }
  
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
  
    // 2) Supabase update
    await supabase
      .from("visitors")
      .update({
        status: "active",
        startTime: Date.now()
      })
      .eq("id", visitorId)
  }
  
  /*
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
  */
  async function removeVisitor(roomId: string, visitorId: number) {
    await supabase.from("visitors").delete().eq("id", visitorId)
  
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? {
              ...room,
              visitors: room.visitors.filter(v => v.id !== visitorId)
            }
          : room
      )
    )
  }
  
  /*
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
          visitors: [...room.visitors, newVisitor],
          dailyTotal: room.dailyTotal + 1
        }
      })
    )
  }
  */
  async function addVisitor(roomId: string, name: string) {
    // 1) Insert into Supabase
    const { data, error } = await supabase
      .from("visitors")
      .insert([
        {
          roomId,
          name,
          status: "waiting",
          startTime: null
        }
      ])
      .select()
  
    if (error) {
      console.error("Insert error:", error)
      return
    }
  
    const inserted = data![0]
  
    // 2) Update local state
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? {
              ...room,
              visitors: [
                ...room.visitors,
                {
                  id: inserted.id,
                  name: inserted.name,
                  status: inserted.status,
                  startTime: inserted.startTime
                }
              ],
              dailyTotal: room.dailyTotal + 1
            }
          : room
      )
    )
  }
  /*
  function clearVisitors(roomId: string) {
    setRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, visitors: [] }
          : room
      )
    )
  }
  */
  async function clearVisitors(roomId: string) {
    await supabase.from("visitors").delete().eq("roomId", roomId)
  
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
            key={selectedRoomId}
            room={selectedRoom}
            onSave={updateRoomSettings}
            onBack={() => setView("room")}
          />
        )}
      </div>

    </div>
  )
}
