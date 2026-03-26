import React from 'react';
import { View } from 'react-native';
import { useEventStore } from '../../store/useEventStore';
import CheckInView from './CheckInView';
import QueueView from './QueueView';
import MatchAssignedView from './MatchAssignedView';

export default function LiveEventScreen() {
  const phase = useEventStore(s => s.phase);

  return (
    <View style={{ flex: 1 }}>
      {(phase === 'idle' || phase === 'checkin') && <CheckInView />}
      {phase === 'queue' && <QueueView />}
      {phase === 'match_assigned' && <MatchAssignedView />}
    </View>
  );
}
