"use client";

import {
  User,
  Bell,
  BellOff,
  Search,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User as UserType } from "@/types/chat";

interface UserDetailPanelProps {
  user: UserType;
}

const sharedFiles = [
  {
    id: 1,
    name: "Design_Guidelines_v2.pdf",
    size: "2.9 MB",
    date: "Oct 22",
    type: "pdf",
    icon: FileText,
    color: "text-red-500 bg-red-500/10",
  },
  {
    id: 2,
    name: "Hero_Concept_Draft.png",
    size: "4.8 MB",
    date: "Oct 19",
    type: "image",
    icon: ImageIcon,
    color: "text-orange-500 bg-orange-500/10",
  },
];

export function UserDetailPanel({ user }: UserDetailPanelProps) {
  return (
    <div className="w-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Profile Card */}
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-24 h-24 mb-4 ring-4 ring-zinc-800">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-2xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-semibold text-white mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Senior Product Designer
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Mute
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                size="icon"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-zinc-800 mb-6" />

          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              About
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Focusing on building scalable design systems and improving user
              experiences across our core dashboard products.
            </p>
          </div>

          <Separator className="bg-zinc-800 mb-6" />

          {/* Shared Files */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Shared Files
              </h3>
              <button className="text-sm text-blue-500 hover:text-blue-400">
                See all
              </button>
            </div>

            <div className="space-y-3">
              {sharedFiles.map((file) => {
                const Icon = file.icon;
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${file.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {file.size} • {file.date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
