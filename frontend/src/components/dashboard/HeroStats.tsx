import { Package, TrendingUp, Users, DollarSign } from 'lucide-react';

interface HeroStatsProps {
  totalListings: number;
  activeAuctions: number;
  totalBids: number;
  totalRevenue: string;
}

export default function HeroStats({ totalListings, activeAuctions, totalBids, totalRevenue }: HeroStatsProps) {
  const cards = [
    {
      title: 'Total Listings',
      value: totalListings,
      icon: Package,
      bar: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Active Auctions',
      value: activeAuctions,
      icon: TrendingUp,
      bar: 'from-green-600 to-emerald-500',
    },
    {
      title: 'Total Bids Received',
      value: totalBids,
      icon: Users,
      bar: 'from-purple-600 to-pink-500',
    },
    {
      title: 'Total Revenue',
      value: totalRevenue,
      icon: DollarSign,
      bar: 'from-orange-500 to-pink-500',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="rounded-2xl glow hover:-translate-y-1 transition-all duration-300 bg-white/5 border border-blue-500/30 backdrop-blur-xl"
        >
          <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${c.bar}`}></div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/10 border border-white/20">
                <c.icon className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-xs text-gray-400">{c.title}</div>
                <div className="text-2xl font-bold text-gray-100 font-rajdhani">{c.value}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}