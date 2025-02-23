import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TrackPlayer, {
  Capability,
  Event,
  State,
  usePlaybackState,
  useProgress,
  AppKilledPlaybackBehavior,
  IOSCategory,
  IOSCategoryOptions
} from 'react-native-track-player';

const setupPlayer = async () => {
  try {
    console.log('Starting player setup...');
    
    // Setup the player first
    await TrackPlayer.setupPlayer({
      // Enable background playback on iOS
      iosCategory: IOSCategory.Playback,
      // Allow mixing with other audio apps
      iosCategoryOptions: [
        IOSCategoryOptions.AllowAirPlay,
        IOSCategoryOptions.AllowBluetooth,
        IOSCategoryOptions.MixWithOthers,
      ],
      // Update progress more frequently
      minBuffer: 100,
      maxBuffer: 200,
      playBuffer: 50,
      backBuffer: 50,
    });
    console.log('Basic player setup done');

    // Update options
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SeekTo,
        Capability.Skip,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      // Update progress every 0.5 seconds
      progressUpdateEventInterval: 500,
    });
    console.log('Player options updated');

    // Reset the queue before adding new tracks
    await TrackPlayer.reset();
    console.log('Queue reset');

    // Add a test track
    await TrackPlayer.add({
      id: '1',
      url: require('./example2.1.mp3'),
      // url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      title: 'Test Track',
      artist: 'Test Artist',
    });
    console.log('Test track added');

    console.log('Player setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

const AudioPlayer: React.FC = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      try {
        const isSetup = await setupPlayer();
        if (mounted && isSetup) {
          setIsPlayerReady(true);
        }
      } catch (error) {
        console.error('Error in setup:', error);
      }
    };

    setup();

    return () => {
      mounted = false;
      TrackPlayer.reset();
    };
  }, []);

  const togglePlayback = async () => {
    try {
      console.log('Current player state:', playbackState.state);
      
      if (!isPlayerReady) {
        console.log('Player is not ready yet');
        return;
      }

      if (playbackState.state === State.Playing) {
        console.log('Pausing playback');
        await TrackPlayer.pause();
      } else {
        console.log('Starting playback');
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error in togglePlayback:', error);
    }
  };

  const skipForward = async () => {
    try {
      await TrackPlayer.seekBy(30);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async () => {
    try {
      await TrackPlayer.seekBy(-30);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const reset = async () => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: '1',
        url: require('./example2.1.mp3'),
        title: 'Test Track',
        artist: 'Test Artist',
      });
    } catch (error) {
      console.error('Error resetting player:', error);
    }
  };

  if (!isPlayerReady) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Now Playing</Text>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipBackward}
        >
          <Text style={styles.controlButtonText}>-30s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayback}
        >
          <Text style={styles.playButtonText}>
            {playbackState.state === State.Playing ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={skipForward}
        >
          <Text style={styles.controlButtonText}>+30s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={reset}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {new Date(progress.position * 1000).toISOString().slice(14, 19)}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressIndicator,
              { width: `${(progress.position / progress.duration) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {new Date(progress.duration * 1000).toISOString().slice(14, 19)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    gap: 16,
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  controlButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default AudioPlayer; 