import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import Colors from '@/constants/colors';
import type { Derby, Participant, CatchEntry, ParticipantRanking } from '@/types/derby';

const STORAGE_KEY = 'wakasagi_derbies';
const ACTIVE_DERBY_KEY = 'wakasagi_active_derby_id';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const [DerbyProvider, useDerby] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [derbies, setDerbies] = useState<Derby[]>([]);
  const [activeDerbyId, setActiveDerbyId] = useState<string | null>(null);

  const derbiesQuery = useQuery({
    queryKey: ['derbies'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const activeId = await AsyncStorage.getItem(ACTIVE_DERBY_KEY);
      return { derbies: stored ? JSON.parse(stored) as Derby[] : [], activeId };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { derbies: Derby[]; activeId: string | null }) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.derbies));
      if (data.activeId) {
        await AsyncStorage.setItem(ACTIVE_DERBY_KEY, data.activeId);
      } else {
        await AsyncStorage.removeItem(ACTIVE_DERBY_KEY);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['derbies'] });
    },
  });

  useEffect(() => {
    if (derbiesQuery.data) {
      setDerbies(derbiesQuery.data.derbies);
      setActiveDerbyId(derbiesQuery.data.activeId);
    }
  }, [derbiesQuery.data]);

  const persist = useCallback((updatedDerbies: Derby[], activeId: string | null) => {
    setDerbies(updatedDerbies);
    setActiveDerbyId(activeId);
    saveMutation.mutate({ derbies: updatedDerbies, activeId });
  }, [saveMutation]);

  const activeDerby = useMemo(() => {
    return derbies.find(d => d.id === activeDerbyId) ?? null;
  }, [derbies, activeDerbyId]);

  const createDerby = useCallback((name: string, location: string, participantNames: string[]) => {
    const participants: Participant[] = participantNames.map((pName, i) => ({
      id: generateId(),
      name: pName,
      color: Colors.participantColors[i % Colors.participantColors.length],
    }));
    const newDerby: Derby = {
      id: generateId(),
      name,
      date: new Date().toISOString().split('T')[0],
      location,
      participants,
      catches: [],
      isActive: true,
      createdAt: Date.now(),
    };
    const updated = [...derbies, newDerby];
    persist(updated, newDerby.id);
    return newDerby;
  }, [derbies, persist]);

  const incrementCatch = useCallback((participantId: string) => {
    if (!activeDerbyId) return;
    const entry: CatchEntry = {
      id: generateId(),
      participantId,
      count: 1,
      timestamp: Date.now(),
    };
    const updated = derbies.map(d =>
      d.id === activeDerbyId
        ? { ...d, catches: [...d.catches, entry] }
        : d
    );
    persist(updated, activeDerbyId);
  }, [derbies, activeDerbyId, persist]);

  const decrementCatch = useCallback((participantId: string) => {
    if (!activeDerbyId || !activeDerby) return;
    const lastCatch = [...activeDerby.catches]
      .reverse()
      .find(c => c.participantId === participantId);
    if (!lastCatch) return;
    const updated = derbies.map(d =>
      d.id === activeDerbyId
        ? { ...d, catches: d.catches.filter(c => c.id !== lastCatch.id) }
        : d
    );
    persist(updated, activeDerbyId);
  }, [derbies, activeDerbyId, activeDerby, persist]);

  const setParticipantIcon = useCallback((participantId: string, icon: string) => {
    if (!activeDerbyId) return;
    const updated = derbies.map(d =>
      d.id === activeDerbyId
        ? {
            ...d,
            participants: d.participants.map(p =>
              p.id === participantId ? { ...p, icon } : p
            ),
          }
        : d
    );
    persist(updated, activeDerbyId);
  }, [derbies, activeDerbyId, persist]);

  const endDerby = useCallback(() => {
    if (!activeDerbyId) return;
    const updated = derbies.map(d =>
      d.id === activeDerbyId ? { ...d, isActive: false } : d
    );
    persist(updated, null);
  }, [derbies, activeDerbyId, persist]);

  const setActiveDerby = useCallback((derbyId: string) => {
    persist(derbies, derbyId);
  }, [derbies, persist]);

  const deleteDerby = useCallback((derbyId: string) => {
    const updated = derbies.filter(d => d.id !== derbyId);
    const newActiveId = activeDerbyId === derbyId ? null : activeDerbyId;
    persist(updated, newActiveId);
  }, [derbies, activeDerbyId, persist]);

  const rankings = useMemo((): ParticipantRanking[] => {
    if (!activeDerby) return [];
    const rankingMap = activeDerby.participants.map(participant => {
      const participantCatches = activeDerby.catches.filter(
        c => c.participantId === participant.id
      );
      const totalCatch = participantCatches.reduce((sum, c) => sum + c.count, 0);
      return {
        participant,
        totalCatch,
        rank: 0,
        catchEntries: participantCatches.sort((a, b) => b.timestamp - a.timestamp),
      };
    });
    rankingMap.sort((a, b) => b.totalCatch - a.totalCatch);
    rankingMap.forEach((r, i) => {
      r.rank = i + 1;
    });
    return rankingMap;
  }, [activeDerby]);

  const totalCatchCount = useMemo(() => {
    return rankings.reduce((sum, r) => sum + r.totalCatch, 0);
  }, [rankings]);

  const getCatchCount = useCallback((participantId: string) => {
    if (!activeDerby) return 0;
    return activeDerby.catches
      .filter(c => c.participantId === participantId)
      .reduce((sum, c) => sum + c.count, 0);
  }, [activeDerby]);

  return {
    derbies,
    activeDerby,
    activeDerbyId,
    rankings,
    totalCatchCount,
    isLoading: derbiesQuery.isLoading,
    createDerby,
    incrementCatch,
    decrementCatch,
    setParticipantIcon,
    endDerby,
    setActiveDerby,
    deleteDerby,
    getCatchCount,
  };
});
