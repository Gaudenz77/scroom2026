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

// ---------------------------------------------------------
// SUPABASE ROW TYPES (fixes "unexpected any")
// ---------------------------------------------------------
type RoomRow = {
  id: string
  name: string
  maxStay: number
  warnTime: number
  maxClients: number
  dailyTotal: number
}

type VisitorRow = {
  id: number
  roomId: string
  name: string
  status: VisitorStatus
  startTime: number | null
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
                startTime: v.startTime ? Number(v.startTime) : null
              }))
          : [],
        dailyTotal: room.dailyTotal
      }))

      setRooms(merged)
    }

    loadData()
  }, [])

  // ---------------------------------------------------------
  // REALTIME LISTENER (SUPABASE)  ← MUST BE BEFORE RETURN
  // ---------------------------------------------------------
  useEffect(() => {
    //
    // 1) INITIAL LOAD
    //
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
                startTime: v.startTime ? Number(v.startTime) : null
              }))
          : [],
        dailyTotal: room.dailyTotal
      }))
  
      setRooms(merged)
    }
  
    loadData()
  
    //
    // 2) REALTIME ROOMS
    //
    const roomsChannel = supabase
      .channel("rooms-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        payload => {
          const updated = payload.new as RoomRow
  
          setRooms(prev =>
            prev.map(room =>
              room.id === updated.id
                ? {
                    ...room,
                    settings: {
                      name: updated.name,
                      maxStay: updated.maxStay,
                      warnTime: updated.warnTime,
                      maxClients: updated.maxClients
                    },
                    dailyTotal: updated.dailyTotal
                  }
                : room
            )
          )
        }
      )
      .subscribe()
  
    //
    // 3) REALTIME VISITORS
    //
    const visitorsChannel = supabase
      .channel("visitors-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitors" },
        payload => {
          console.log("EVENT:", payload.eventType)
          console.log("PAYLOAD:", payload)
  
          setRooms(prev => {
            switch (payload.eventType) {
              //
              // INSERT
              //
              case "INSERT": {
                const inserted = payload.new as VisitorRow
                return prev.map(room =>
                  room.id === inserted.roomId
                    ? {
                        ...room,
                        visitors: [
                          ...room.visitors,
                          {
                            id: inserted.id,
                            name: inserted.name,
                            status: inserted.status,
                            startTime: inserted.startTime
                              ? Number(inserted.startTime)
                              : null
                          }
                        ]
                      }
                    : room
                )
              }
  
              //
              // UPDATE
              //
              case "UPDATE": {
                const updated = payload.new as VisitorRow
                return prev.map(room =>
                  room.id === updated.roomId
                    ? {
                        ...room,
                        visitors: room.visitors.map(v =>
                          v.id === updated.id
                            ? {
                                id: updated.id,
                                name: updated.name,
                                status: updated.status,
                                startTime: updated.startTime
                                  ? Number(updated.startTime)
                                  : null
                              }
                            : v
                        )
                      }
                    : room
                )
              }
  
              //
              // DELETE
              //
              case "DELETE": {
                const deleted = payload.old as VisitorRow
                return prev.map(room =>
                  room.id === deleted.roomId
                    ? {
                        ...room,
                        visitors: room.visitors.filter(v => v.id !== deleted.id)
                      }
                    : room
                )
              }
  
              //
              // DEFAULT
              //
              default:
                return prev
            }
          })
        }
      )
      .subscribe()
  
    //
    // 4) CLEANUP
    //
    return () => {
      supabase.removeChannel(roomsChannel)
      supabase.removeChannel(visitorsChannel)
    }
  }, [])


  // ---------------------------------------------------------
  // NOW the loading guard is safe
  // ---------------------------------------------------------
  if (rooms.length === 0) {
    return <div className="p-4 text-white">Loading…</div>
  }

  const selectedRoom = rooms.find(r => r.id === selectedRoomId)!

  // ---------------------------------------------------------
  // UPDATE SETTINGS (LOCAL ONLY FOR NOW)
  // ---------------------------------------------------------
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
  async function setVisitorActive(roomId: string, visitorId: number) {
    console.log("Activating visitor", { roomId, visitorId })
  
    const { data, error } = await supabase.rpc(
      "activate_visitor_if_space",
      {
        room_id: roomId,
        visitor_id: visitorId
      }
    )
  
    console.log("RPC result:", { data, error })
  
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Activation failed",
        text: "Backend RPC returned an error. Check console.",
        confirmButtonText: "OK"
      })
      return
    }
  
    if (data === "full") {
      Swal.fire({
        icon: "warning",
        title: "Room full",
        text: "No free spaces available.",
        confirmButtonText: "OK"
      })
      return
    }
  
  }
  

  async function removeVisitor(roomId: string, visitorId: number) {
    await supabase.from("visitors").delete().eq("id", visitorId)
  }

  async function addVisitor(roomId: string, name: string) {
  // 1) Insert visitor
  const { error } = await supabase
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

    // 2) Increment dailyTotal atomically
    await supabase.rpc("increment_daily_total", { room_id: roomId })
  }

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
    <div className="min-h-screen w-full flex flex-col bg-base-100 text-base-content">

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
