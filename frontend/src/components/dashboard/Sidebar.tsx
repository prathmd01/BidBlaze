import { Home, Package, BarChart3, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const items = [
    { icon: Home, label: 'Home' },
    { icon: Package, label: 'Listings' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="group fixed left-4 top-24 z-30">
      <div className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl p-2 flex flex-col gap-2">
        {items.map((Item, idx) => (
          <button
            key={idx}
            className="relative flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-all"
            title={Item.label}
            onClick={() => Item.label === 'Home' ? navigate('/') : undefined}
          >
            <Item.icon className="h-5 w-5 text-blue-300" />
            <span className="absolute left-12 opacity-0 group-hover:opacity-100 text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
              {Item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}