import { supabase } from './supabase';

// 読み間違いしやすい文字（0/O/1/I）を除外したアルファベット+数字
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomId(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => CHARS[b % CHARS.length])
    .join('');
}

export async function createUniqueRoomId(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const id = generateRoomId();
    const { count } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', id);
    if ((count ?? 0) === 0) return id;
  }
  throw new Error('Could not generate unique room ID');
}
