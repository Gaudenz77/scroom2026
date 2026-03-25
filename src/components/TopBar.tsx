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

  const changeTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    document.documentElement.setAttribute("data-theme", e.target.value)
  }

  return (
    <div className="w-full flex items-center justify-between bg-base-200 p-4 border-b border-base-300">

      {/* Room selector */}
      <select
        className="select select-bordered"
        value={selectedRoomId}
        onChange={(e) => onSelectRoom(e.target.value)}
      >
        {rooms.map(room => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      {/* Right side: theme + settings */}
      <div className="flex items-center gap-3">

        {/* Theme selector */}
        <select
          className="select select-bordered"
          defaultValue="synthwave"
          onChange={changeTheme}
        >
          <option disabled>Theme</option>
          <option value="light">light</option>
          <option value="dark">dark</option>
          <option value="cupcake">cupcake</option>
          <option value="cyberpunk">cyberpunk</option>
          <option value="dracula">dracula</option>
          <option value="synthwave">synthwave</option>
          <option value="valentine">valentine</option>
          <option value="halloween">halloween</option>
          <option value="garden">garden</option>
          <option value="forest">forest</option>
          <option value="winter">winter</option>
        </select>

        {/* Gear icon */}
        <button
          onClick={onOpenSettings}
          className="btn btn-ghost"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>
    </div>
  )
}


/*

// WITHOUT THEME DAISYUI

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
        
         // Dropdown  
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
  
         // Gear icon  
        <button
          onClick={onOpenSettings}
          className="p-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          <i className="fa-solid fa-gear"></i>
        </button>
      </div>
    )
  }
  */