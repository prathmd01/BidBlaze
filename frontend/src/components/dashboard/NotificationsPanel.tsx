interface Notification {
  id: string;
  message: string;
  time: string;
  type?: 'bid' | 'message' | 'system';
}

interface NotificationsPanelProps {
  notifications: Notification[];
}

export default function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  return (
    <aside className="rounded-2xl bg-white/5 border border-blue-500/30 backdrop-blur-xl p-4">
      <h4 className="text-sm text-gray-300 mb-3">Notifications / Recent Activity</h4>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="p-3 rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 text-gray-200">
            <div className="text-sm">{n.message}</div>
            <div className="text-xs text-gray-400 mt-1">{n.time}</div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-xs text-gray-500">No recent activity</div>
        )}
      </div>
    </aside>
  );
}