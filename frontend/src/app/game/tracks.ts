import { TrackDefinition, TrackId } from './race.models';

export const TRACKS: readonly TrackDefinition[] = [
  {
    id: 'green-hills',
    name: 'Green Hills',
    subtitle: 'Fast sweepers through the highlands',
    backgroundColor: 0x315c3a,
    roadColor: 0x30353a,
    shoulderColor: 0xd9d8cf,
    accentColor: 0xd94b46,
    points: [
      [370, 650],
      [260, 470],
      [330, 245],
      [650, 160],
      [980, 215],
      [1310, 180],
      [1510, 390],
      [1440, 690],
      [1160, 850],
      [780, 810],
    ],
  },
  {
    id: 'desert-track',
    name: 'Desert Track',
    subtitle: 'Long curves across the red basin',
    backgroundColor: 0xa5683f,
    roadColor: 0x3c3937,
    shoulderColor: 0xe8c08b,
    accentColor: 0x292c30,
    points: [
      [300, 690],
      [180, 430],
      [360, 190],
      [720, 250],
      [1060, 125],
      [1490, 270],
      [1570, 590],
      [1330, 830],
      [980, 720],
      [630, 870],
    ],
  },
] as const;

export function getTrack(trackId: string | null): TrackDefinition | undefined {
  return TRACKS.find((track) => track.id === (trackId as TrackId));
}
