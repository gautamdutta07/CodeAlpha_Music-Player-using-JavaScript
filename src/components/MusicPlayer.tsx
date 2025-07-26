import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  List
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover: string;
  src: string;
}

const MusicPlayer = () => {
  // Sample playlist with demo audio URLs
  const playlist: Song[] = [
    {
      id: 1,
      title: "Chill Vibes",
      artist: "Lo-Fi Artist",
      duration: 180,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
      src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    },
    {
      id: 2,
      title: "Ocean Waves",
      artist: "Nature Sounds",
      duration: 240,
      cover: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop&crop=center",
      src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    },
    {
      id: 3,
      title: "Midnight Jazz",
      artist: "Jazz Collective",
      duration: 210,
      cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
      src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
    }
  ];

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: none, 1: all, 2: one
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      if (repeatMode === 2) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSongIndex, repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentSongIndex + 1) % playlist.length;
    }
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
  };

  const prevSong = () => {
    const prevIndex = currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    setCurrentTime(0);
  };

  const seek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (value[0] / 100) * currentSong.duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / currentSong.duration) * 100;

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        {/* Main Player Card */}
        <Card className="bg-card border-border shadow-player p-6 mb-4">
          {/* Album Art */}
          <div className="relative mb-6">
            <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-album">
              <img 
                src={currentSong.cover} 
                alt={currentSong.title}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isPlaying ? 'animate-pulse-slow' : ''
                }`}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-player-accent text-player-accent' : 'text-muted-foreground'}`} />
            </Button>
          </div>

          {/* Song Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-1">{currentSong.title}</h2>
            <p className="text-muted-foreground text-lg">{currentSong.artist}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Slider
              value={[progress]}
              onValueChange={seek}
              max={100}
              step={0.1}
              className="mb-2"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsShuffled(!isShuffled)}
            >
              <Shuffle className={`w-5 h-5 ${isShuffled ? 'text-player-accent' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-player-accent"
              onClick={prevSong}
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              size="icon"
              className="w-12 h-12 bg-player-gradient hover:opacity-90 text-white shadow-lg"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-player-accent"
              onClick={nextSong}
            >
              <SkipForward className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setRepeatMode((prev) => (prev + 1) % 3)}
            >
              <Repeat className={`w-5 h-5 ${repeatMode > 0 ? 'text-player-accent' : ''}`} />
              {repeatMode === 2 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-player-accent rounded-full" />}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(value) => {
                setVolume(value[0]);
                setIsMuted(false);
              }}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Playlist Toggle */}
        <Button
          variant="outline"
          className="w-full mb-4 border-border hover:bg-secondary"
          onClick={() => setShowPlaylist(!showPlaylist)}
        >
          <List className="w-4 h-4 mr-2" />
          {showPlaylist ? 'Hide Playlist' : 'Show Playlist'}
        </Button>

        {/* Playlist */}
        {showPlaylist && (
          <Card className="bg-card border-border p-4">
            <h3 className="text-lg font-semibold mb-4">Playlist</h3>
            <div className="space-y-2">
              {playlist.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentSongIndex 
                      ? 'bg-player-accent/20 border border-player-accent/30' 
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => {
                    setCurrentSongIndex(index);
                    setCurrentTime(0);
                  }}
                >
                  <img 
                    src={song.cover} 
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      index === currentSongIndex ? 'text-player-accent' : 'text-foreground'
                    }`}>
                      {song.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(song.duration)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.src}
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;