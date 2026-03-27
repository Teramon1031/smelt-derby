import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { getSessionId } from './useSessionId';
import type { RoomData, RoomCatchEvent } from '@/types/room';

export interface RoomDerbyState {
  room: RoomData | null;
  counts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  isCreator: boolean;
  incrementCatch: (participantId: string) => Promise<void>;
  decrementCatch: (participantId: string) => Promise<void>;
  endDerby: () => Promise<void>;
}

interface UseRoomDerbyOptions {
  /** true のとき is_active=false でも results へリダイレクトしない（results 画面自身で使う） */
  noRedirect?: boolean;
}

export function useRoomDerby(roomId: string, options?: UseRoomDerbyOptions): RoomDerbyState {
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    getSessionId().then(id => { sessionIdRef.current = id; });
  }, []);

  useEffect(() => {
    if (!roomId) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      setIsLoading(true);
      setError(null);

      // 1. ルーム情報を取得
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (roomError || !roomData) {
        setError('room_not_found');
        setIsLoading(false);
        return;
      }

      // JSON から Participant[] を復元
      const parsedRoom: RoomData = {
        ...roomData,
        participants: Array.isArray(roomData.participants)
          ? roomData.participants
          : JSON.parse(roomData.participants as string),
      };
      setRoom(parsedRoom);

      // ダービーが既に終了していたら結果画面へ（noRedirect=true の場合はスキップ）
      if (!parsedRoom.is_active && !options?.noRedirect) {
        router.replace(`/room/${roomId}/results` as any);
        return;
      }

      // 2. 既存の catch_events を全件取得して初期カウントを計算
      const { data: events, error: eventsError } = await supabase
        .from('catch_events')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!eventsError && events) {
        const initialCounts: Record<string, number> = {};
        for (const ev of events as RoomCatchEvent[]) {
          initialCounts[ev.participant_id] = Math.max(
            0,
            (initialCounts[ev.participant_id] ?? 0) + ev.delta
          );
        }
        setCounts(initialCounts);
      }

      setIsLoading(false);

      // 3. Realtime サブスクリプション開始
      channel = supabase.channel(`room-derby-${roomId}`);

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'catch_events',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const ev = payload.new as RoomCatchEvent;
            setCounts(prev => ({
              ...prev,
              [ev.participant_id]: Math.max(
                0,
                (prev[ev.participant_id] ?? 0) + ev.delta
              ),
            }));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            const updated = payload.new as RoomData;
            setRoom(prev => prev ? { ...prev, ...updated } : prev);
            if (!updated.is_active && !options?.noRedirect) {
              router.replace(`/room/${roomId}/results` as any);
            }
          }
        )
        .subscribe();
    }

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId]);

  const incrementCatch = useCallback(async (participantId: string) => {
    await supabase.from('catch_events').insert({
      room_id: roomId,
      participant_id: participantId,
      delta: 1,
      client_id: sessionIdRef.current,
    });
  }, [roomId]);

  const decrementCatch = useCallback(async (participantId: string) => {
    // カウントが0以下なら何もしない
    setCounts(prev => {
      if ((prev[participantId] ?? 0) <= 0) return prev;
      return prev; // 実際の更新は Realtime から来る
    });

    const currentCount = counts[participantId] ?? 0;
    if (currentCount <= 0) return;

    await supabase.from('catch_events').insert({
      room_id: roomId,
      participant_id: participantId,
      delta: -1,
      client_id: sessionIdRef.current,
    });
  }, [roomId, counts]);

  const endDerby = useCallback(async () => {
    await supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('room_id', roomId);
  }, [roomId]);

  const isCreator = Boolean(room && sessionIdRef.current && room.created_by === sessionIdRef.current);

  return { room, counts, isLoading, error, isCreator, incrementCatch, decrementCatch, endDerby };
}
