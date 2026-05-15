export const SHOP_CATALOG = {
  board: [
    { id: 'default',  name: 'Scratched Wood',  price: 0,   description: 'The classic starter deck' },
    { id: 'flames',   name: 'Flame Deck',       price: 50,  description: 'Ride hot' },
    { id: 'galaxy',   name: 'Galaxy Deck',      price: 100, description: 'From another dimension' },
    { id: 'checker',  name: 'Checkerboard',     price: 150, description: 'Old school vibes' },
    { id: 'neon',     name: 'Neon Spray',       price: 250, description: 'Glow up' },
    { id: 'gold',     name: 'Gold Foil',        price: 500, description: 'Legendary status' },
  ],
  wheels: [
    { id: 'classic',  name: 'Classic White',    price: 0,   description: 'Clean and simple' },
    { id: 'red',      name: 'Red Hot',          price: 40,  description: 'Speed demon' },
    { id: 'blue',     name: 'Blue Ice',         price: 40,  description: 'Smooth as ice' },
    { id: 'neongrn',  name: 'Neon Green',       price: 80,  description: 'Glowing in the dark' },
    { id: 'rainbow',  name: 'Rainbow',          price: 150, description: 'All the colors' },
  ],
  trucks: [
    { id: 'steel',    name: 'Steel',            price: 0,   description: 'Solid and reliable' },
    { id: 'black',    name: 'Black Chrome',     price: 60,  description: 'Stealthy grind' },
    { id: 'glow',     name: 'Glow in Dark',     price: 120, description: 'Night sessions only' },
    { id: 'gold',     name: 'Gold Trucks',      price: 150, description: 'Pro setup' },
  ],
  character: [
    { id: 'default',  name: 'Default Dude',     price: 0,   description: 'Just getting started' },
    { id: 'street',   name: 'Street Kid',       price: 75,  description: 'Born on the pavement' },
    { id: 'halfpipe', name: 'Half Pipe Harry',  price: 150, description: 'Vert is life' },
    { id: 'pro',      name: 'Pro Skater',       price: 300, description: 'The real deal' },
  ],
}

export const WHEEL_COLORS = {
  classic: '#e5e5e5',
  red:     '#ef4444',
  blue:    '#3b82f6',
  neongrn: '#22c55e',
  rainbow: '#a855f7',
}

export const TRUCK_COLORS = {
  steel: '#9ca3af',
  black: '#1f2937',
  glow:  '#00ffea',
  gold:  '#b8860b',
}

export function getWheelColor(id) {
  return WHEEL_COLORS[id] ?? WHEEL_COLORS.classic
}

export function getTruckColor(id) {
  return TRUCK_COLORS[id] ?? TRUCK_COLORS.steel
}

export const STARTER_ITEMS = [
  { id: 'default', category: 'board' },
  { id: 'classic', category: 'wheels' },
  { id: 'steel',   category: 'trucks' },
  { id: 'default', category: 'character' },
]

export const CATEGORY_LABELS = {
  board:     'BOARDS',
  wheels:    'WHEELS',
  trucks:    'TRUCKS',
  character: 'CHARACTERS',
}
