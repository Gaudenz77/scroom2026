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
          <option value="bumblebee">bumblebee</option>
          <option value="emerald">emerald</option>
          <option value="corporate">corporate</option>
          <option value="synthwave">synthwave</option>
          <option value="retro">retro</option>
          <option value="cyberpunk">cyberpunk</option>
          <option value="valentine">valentine</option>
          <option value="halloween">halloween</option>
          <option value="garden">garden</option>
          <option value="forest">forest</option>
          <option value="aqua">aqua</option>
          <option value="lofi">lofi</option>
          <option value="pastel">pastel</option>
          <option value="fantasy">fantasy</option>
          <option value="wireframe">wireframe</option>
          <option value="black">black</option>
          <option value="luxury">luxury</option>
          <option value="dracula">dracula</option>
          <option value="cmyk">cmyk</option>
          <option value="autumn">autumn</option>
          <option value="business">business</option>
          <option value="acid">acid</option>
          <option value="lemonade">lemonade</option>
          <option value="night">night</option>
          <option value="coffee">coffee</option>
          <option value="winter">winter</option>
          <option value="dim">dim</option>
          <option value="nord">nord</option>
          <option value="sunset">sunset</option>
          <option value="caramellatte">caramellatte</option>
          <option value="abyss">abyss</option>
          <option value="silk">silk</option>

        </select>

        {/* Gear icon */}
        <button
          onClick={onOpenSettings}
          className="btn btn-ghost"
        >
          <i className="fa-solid fa-gear fa-2x"></i>
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