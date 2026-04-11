interface AnalyticsSectionProps {
  bidsOverTime: number[];
  topItems: { name: string; value: number }[];
  revenueTrend: number[];
}

export default function AnalyticsSection({ bidsOverTime, topItems, revenueTrend }: AnalyticsSectionProps) {
  // Simple SVG line chart for dark neon theme without external deps
  const LineChart = ({ data, color }: { data: number[]; color: string }) => {
    const width = 500;
    const height = 120;
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(' ');
    return (
      <svg width={width} height={height} className="w-full">
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
        {[...Array(10)].map((_, i) => (
          <line key={i} x1={(i / 10) * width} x2={(i / 10) * width} y1={0} y2={height} stroke="rgba(99,102,241,0.15)" />
        ))}
      </svg>
    );
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl p-4">
        <h4 className="text-sm text-gray-300 mb-2">Bids Over Time</h4>
        <LineChart data={bidsOverTime} color="rgba(99,102,241,0.8)" />
      </div>
      <div className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl p-4">
        <h4 className="text-sm text-gray-300 mb-3">Top Performing Items</h4>
        <div className="space-y-2">
          {topItems.map((t, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-24 text-gray-300 text-xs">{t.name}</div>
              <div className="flex-1 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${t.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl p-4">
        <h4 className="text-sm text-gray-300 mb-2">Revenue Trend</h4>
        <LineChart data={revenueTrend} color="rgba(234,88,12,0.8)" />
      </div>
    </section>
  );
}