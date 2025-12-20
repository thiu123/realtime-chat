"use client";
import { ChatAvatar } from "./Avatar";
import { Mail, Phone, MapPin, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const currentUser = {
  id: "me",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
  joinedDate: "January 2023",
  status: "online",
  bio: "Product designer & coffee enthusiast ☕",
};

export function UserProfileButton() {
  const user = useAuthStore((state) => state.user);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
          <ChatAvatar
            src={currentUser.avatar}
            alt={currentUser.name}
            size="md"
            online={currentUser.status === "online"}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" sideOffset={8}>
        <div className="p-4 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <ChatAvatar
              src={currentUser.avatar}
              alt={currentUser.name}
              size="lg"
              online={currentUser.status === "online"}
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground truncate">
                {user?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user?.bio}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">
                {user?.email || currentUser.email}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{user?.phone || currentUser.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{user?.location || currentUser.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {user?.joinedDate || currentUser.joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
