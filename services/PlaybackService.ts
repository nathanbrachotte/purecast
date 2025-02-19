import TrackPlayer, { Event, State } from 'react-native-track-player';

let lastJumpTime = 0;

export async function PlaybackService() {
  // This event is triggered regularly during playback (every second by default)
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async ({ position }) => {
    try {
      // Check if 2 minutes have passed since the last jump
      if (position - lastJumpTime >= 120) {
        const state = await TrackPlayer.getState();
        if (state === State.Playing) {
          console.log(`Current position: ${position}, Last jump: ${lastJumpTime}`);
          console.log('Jumping forward 30 seconds');
          await TrackPlayer.seekBy(30);
          lastJumpTime = position;
        }
      }
    } catch (error) {
      console.error('Error in progress handler:', error);
    }
  });

  // Playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, (state) => {
    console.log('Playback state changed:', state);
  });

  // Track changes
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, (track) => {
    console.log('Track changed:', track);
  });

  // Playback error
  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('Playback error:', error);
  });

  // Basic playback controls
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
  TrackPlayer.addEventListener(Event.RemoteJumpForward, () => TrackPlayer.seekBy(30));
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, () => TrackPlayer.seekBy(-30));
} 