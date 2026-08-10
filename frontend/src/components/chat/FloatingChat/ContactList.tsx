import React from 'react';
import { Search, Headset, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ContactMeta } from './types';
import { formatTime } from './utils';

interface ContactListProps {
  lang: 'th' | 'en' | 'cn';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredContacts: ContactMeta[];
  lastViewedTimestamps: Record<string, number>;
  openContact: (id: string) => void;
  onOpenFullChat: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  lang,
  searchTerm,
  setSearchTerm,
  filteredContacts,
  lastViewedTimestamps,
  openContact,
  onOpenFullChat,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* List Header */}
      <div className="px-5 pt-5 pb-3 border-b border-gray-50 bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-gray-900">
            {lang === 'th' ? 'ข้อความ' : lang === 'cn' ? '消息' : 'Messages'}
          </h3>
          <button
            onClick={onOpenFullChat}
            className="text-[10px] font-bold text-primary hover:underline"
          >
            {lang === 'th' ? 'เปิดทั้งหมด' : 'Open full chat'}
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            placeholder={lang === 'th' ? 'ค้นหา...' : 'Search...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs font-semibold bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 transition-all"
          />
        </div>
      </div>

      {/* Contact List */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredContacts.map(contact => {
            const hasUnread = (() => {
              const last = lastViewedTimestamps[contact.id];
              const ts = contact.timestamp instanceof Date
                ? contact.timestamp.getTime()
                : contact.timestamp?.toDate
                  ? contact.timestamp.toDate().getTime()
                  : 0;
              return !last || ts > last;
            })();

            return (
              <button
                key={contact.id}
                onClick={() => openContact(contact.id)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12 rounded-full border-2 border-white shadow-sm">
                    <AvatarImage src={contact.photoURL} />
                    <AvatarFallback className={cn(
                      'text-white text-sm font-black',
                      contact.isAdmin ? 'bg-gray-800' : 'bg-primary'
                    )}>
                      {contact.isAdmin ? <Headset className="w-4 h-4" /> : contact.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className={cn(
                      'text-sm font-bold truncate flex items-center gap-1',
                      hasUnread ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {contact.displayName}
                      {contact.isAdmin && <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />}
                    </span>
                    <span suppressHydrationWarning className="text-[10px] text-gray-400 flex-shrink-0">
                      {contact.timestamp ? formatTime(contact.timestamp) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      'text-xs truncate',
                      hasUnread ? 'font-semibold text-gray-700' : 'font-normal text-gray-400'
                    )}>
                      {contact.lastMessage || (lang === 'th' ? 'เริ่มสนทนา...' : 'Start chatting...')}
                    </p>
                    {hasUnread && (
                      <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
