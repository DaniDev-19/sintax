import React from 'react';
import { useStore } from '../context/StoreContext';
import { Bell, CheckCheck, BookOpen, Award, Calendar, Sparkles, FileText, Star, X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead } = useStore();

  if (!isOpen) return null;

  const userNotifications = notifications.filter((n) => n.userId === currentUser.id);

  const getIcon = (type: string) => {
    switch (type) {
      case 'evaluation':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'grade':
        return <Award className="w-4 h-4 text-emerald-500" />;
      case 'attendance':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-cyan-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-3xl w-full max-w-md p-5 shadow-[6px_6px_0px_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[var(--border-main)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[var(--text-main)]">Notificaciones</h3>
              <p className="text-[11px] text-[var(--text-muted)]">Tus avisos y novedades académicas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action to mark all as read */}
        {userNotifications.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-indigo-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* List */}
        <div className="space-y-2.5 overflow-y-auto my-3 pr-1 flex-1">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              <Bell className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2 opacity-40" />
              No tienes notificaciones pendientes.
            </div>
          ) : (
            userNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationAsRead(n.id);
                  if (n.linkTab) {
                    onNavigateTab(n.linkTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer shadow-[2px_2px_0px_var(--shadow-color)] ${
                  !n.read
                    ? 'bg-indigo-500/10 border-indigo-500'
                    : 'bg-[var(--bg-app)] border-[var(--border-main)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-main)] shadow-[1px_1px_0px_var(--shadow-color)] mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black text-[var(--text-main)]">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 animate-ping" />
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono mt-1.5 block">
                      {n.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
