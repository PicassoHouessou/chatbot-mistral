"use client";

import { Bot, Plus, MessageSquare, Trash2, LogOut, User } from "lucide-react";
import { Conversation } from "@/types";
import { signOut } from "next-auth/react";

interface SidebarProps {
  conversations: Conversation[];
  currentConvId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  userName: string;
  userPseudo: string;
}

export default function Sidebar({
  conversations,
  currentConvId,
  onSelect,
  onNew,
  onDelete,
  userName,
  userPseudo,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
            <Bot size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">Chat-Bot</h1>
            <p className="text-gray-500 text-xs">Mistral AI</p>
          </div>
        </div>

        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition"
        >
          <Plus size={16} />
          Nouvelle discussion
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="text-gray-600 text-xs text-center mt-8 px-4">
            Aucune discussion. Commencez à chatter !
          </p>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition ${
                  currentConvId === conv.id
                    ? "bg-orange-500/15 border border-orange-500/30"
                    : "hover:bg-gray-800 border border-transparent"
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare
                  size={14}
                  className={
                    currentConvId === conv.id ? "text-orange-400" : "text-gray-500"
                  }
                />
                <span
                  className={`flex-1 text-xs truncate ${
                    currentConvId === conv.id ? "text-white" : "text-gray-400"
                  }`}
                >
                  {conv.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <User size={14} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{userName}</p>
            <p className="text-gray-500 text-xs truncate">@{userPseudo}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-600 hover:text-red-400 transition"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
