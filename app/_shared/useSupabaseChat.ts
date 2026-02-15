"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowser } from "@/app/_shared/supabase-browser";

export type ChatMsg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export function useSupabaseChat(conversationId: string) {
  const supabase = useMemo(() => createSupabaseBrowser(), []);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setMe(data.user?.id ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!conversationId) return;

    let alive = true;

    async function loadHistory() {
      const { data, error } = await supabase
        .from("messages")
        .select("id,sender_id,body,created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!alive) return;
      if (!error) setMessages((data as ChatMsg[]) || []);
    }

    loadHistory();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as ChatMsg;
          setMessages((prev) => [...prev, m]);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      alive = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, supabase]);

  async function send(body: string) {
    const text = body.trim();
    if (!text || !me || !conversationId) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: me,
      body: text,
    });
  }

  return { me, messages, send };
}
