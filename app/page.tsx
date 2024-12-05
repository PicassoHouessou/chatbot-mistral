"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { fetchConversations } from "@/lib/storage";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchConversations().then((convs) => {
        if (convs.length > 0) {
          router.replace(`/chat/${convs[0].id}`);
        } else {
          router.replace("/chat");
        }
      });
    }
  }, [status]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Loader2 className="animate-spin text-orange-400" size={40} />
    </div>
  );
}
