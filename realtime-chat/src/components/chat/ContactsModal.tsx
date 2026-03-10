"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/chat.store";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContactsModalProps {
  onSelectUser: (userId: string) => void;
}

export function ContactsModal({ onSelectUser }: ContactsModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const users = useChatStore((state) => state.users);

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (userId: string) => {
    onSelectUser(userId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium mb-4 rounded-xl h-11">
          <UserPlus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 border-b border-zinc-800 bg-zinc-950/50">
          <DialogTitle className="text-xl font-semibold">New Chat</DialogTitle>
          <p className="text-sm text-zinc-400 mt-1">Select a user to start chatting</p>
        </DialogHeader>
        
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <ScrollArea className="max-h-[300px] min-h-[200px] p-2">
          {filteredUsers.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-500 space-y-3">
              <div className="w-12 h-12 rounded-full border border-dashed border-zinc-700 flex items-center justify-center bg-zinc-800/20">
                <Search className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-sm">No users found</p>
           </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelect(user._id)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60 transition-colors w-full text-left"
                >
                  <Avatar className="w-10 h-10 ring-2 ring-zinc-800/50">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-medium text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-200 truncate">{user.name}</h3>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
