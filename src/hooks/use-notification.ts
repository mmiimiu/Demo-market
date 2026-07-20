import { useNotifications } from '@/contexts/NotificationContext';

export function useNotification() {
  const { addNotification } = useNotifications();

  return {
    success: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'success', title, message, action });
    },
    error: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'error', title, message, action });
    },
    warning: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'warning', title, message, action });
    },
    info: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'info', title, message, action });
    },
    newProperty: (title: string, message: string, propertyId?: number, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'new_property', title, message, propertyId, action });
    },
    propertyUpdate: (title: string, message: string, propertyId?: number, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'property_update', title, message, propertyId, action });
    },
    chatMessage: (title: string, message: string, chatId?: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'chat_message', title, message, chatId, action });
    },
    booking: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'booking', title, message, action });
    },
    system: (title: string, message: string, action?: { label: string; onClick: () => void }) => {
      addNotification({ type: 'system', title, message, action });
    }
  };
}
