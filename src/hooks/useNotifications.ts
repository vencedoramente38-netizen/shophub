import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
  time: Date;
  read: boolean;
}

const NOTIFICATIONS_KEY = "tiktokSyncNotifications";
const ENABLED_KEY = "notificationsEnabled";

export function useNotifications() {
  const stored = localStorage.getItem(ENABLED_KEY);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    stored !== null ? stored === "true" : false
  );
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed.map((n: AppNotification) => ({
          ...n,
          time: new Date(n.time)
        })));
      } catch {
        setNotifications([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ENABLED_KEY, String(notificationsEnabled));
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);



  const addNotification = useCallback((message: string, type: NotificationType = "info") => {
    if (!notificationsEnabled) return;

    const newNotification: AppNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));

    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast.info(message);
    }
  }, [notificationsEnabled]);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Supabase Realtime listener for Kirvano sales
  useEffect(() => {
    const channel = supabase
      .channel('public:sales_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sales_events',
        },
        (payload) => {
          console.log('New sale event received!', payload);
          const newSale = payload.new;
          const message = `Venda Realizada! ${newSale.customer_name} comprou R$ ${newSale.amount.toFixed(2)}`;
          addNotification(message, "success");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addNotification]);

  return {
    notifications,
    notificationsEnabled,
    setNotificationsEnabled,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount
  };
}
