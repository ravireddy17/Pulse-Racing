import { getTrack, TRACKS } from './tracks';

describe('track definitions', () => {
  it('provides both playable circuits with closed-loop control data', () => {
    expect(TRACKS.map((track) => track.id)).toEqual(['green-hills', 'desert-track']);
    expect(TRACKS.every((track) => track.points.length >= 8)).toBe(true);
    expect(getTrack('green-hills')?.name).toBe('Green Hills');
    expect(getTrack('unknown')).toBeUndefined();
  });
});
