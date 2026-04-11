import { Eye, Trash2, ListOrdered } from 'lucide-react';

export interface ListingRow {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  currentBid: string;
  highestBidderName: string;
  status: 'Active' | 'Closed' | 'Draft' | string;
  totalBids?: number;
}

interface ListingsTableProps {
  rows: ListingRow[];
  onView?: (id: string) => void;
  onViewBids?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ListingsTable({ rows, onView, onViewBids, onDelete }: ListingsTableProps) {
  return (
    <div className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
        <h3 className="text-gray-100 font-semibold font-orbitron">Active Listings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 w-32">Item</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Current Highest Bid</th>
              <th className="px-4 py-3">Highest Bidder</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-56">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-blue-500/10 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <img src={row.imageUrl} alt={row.name} className="h-14 w-20 object-cover rounded-xl border border-white/10" />
                </td>
                <td className="px-4 py-3 text-gray-200 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-gray-300">{row.category}</td>
                <td className="px-4 py-3 text-blue-300 font-semibold">{row.currentBid}</td>
                <td className="px-4 py-3 text-pink-300">{row.highestBidderName}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-gray-300">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 transition-all"
                      onClick={() => onView?.(row.id)}
                    >
                      <Eye className="h-3.5 w-3.5 inline mr-1" /> View
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white text-xs hover:-translate-y-0.5 transition-all"
                      onClick={() => onViewBids?.(row.id)}
                    >
                      <ListOrdered className="h-3.5 w-3.5 inline mr-1" /> View Bids
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-xl text-white text-xs transition-all ${row.totalBids && row.totalBids > 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-red-600 hover:-translate-y-0.5'}`}
                      disabled={Boolean(row.totalBids && row.totalBids > 0)}
                      onClick={() => onDelete?.(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}