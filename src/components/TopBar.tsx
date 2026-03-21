type TopBarProps = {
    rooms: { id: string; name: string }[]
    selectedRoomId: string
    onSelectRoom: (id: string) => void
    onOpenSettings: () => void
  }
  
  export default function TopBar({
    rooms,
    selectedRoomId,
    onSelectRoom,
    onOpenSettings
  }: TopBarProps) {
  
    return (
      <div className="w-full flex items-center justify-between bg-gray-100 p-4 border-b">
        
        {/* Dropdown */}
        <select
          className="px-3 py-2 border rounded bg-white"
          value={selectedRoomId}
          onChange={(e) => onSelectRoom(e.target.value)}
        >
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
  
        {/* Gear icon */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          ⚙️
        </button>
      </div>
    )
  }
  