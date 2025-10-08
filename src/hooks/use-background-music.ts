'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';

const THEME_MUSIC_MAP = {
  default: '/sounds/default-theme-sound.mp3',
  nightops: '/sounds/nightops-theme-sound.mp3',
  cscz: '/sounds/cscz-theme-sound.mp3',
} as const;

class MusicManager {
  private static instance: MusicManager | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, HTMLAudioElement>();
  private currentTheme: string | null = null;
  private isPlaying = false;
  private isLoading = false;
  private listeners: Set<() => void> = new Set();

  static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  private constructor() {
    this.isPlaying = false;
  }

  addListener(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }

  private createAudio(musicPath: string): HTMLAudioElement {
    const audio = new Audio();
    audio.preload = 'none';
    audio.loop = true;
    audio.volume = 0.3;

    audio.addEventListener('loadstart', () => {
      this.isLoading = true;
      this.notifyListeners();
    });

    audio.addEventListener('canplaythrough', () => {
      this.isLoading = false;
      this.notifyListeners();
      if (this.isPlaying && this.currentAudio === audio) {
        audio.play().catch(console.error);
      }
    });

    audio.addEventListener('error', () => {
      this.isLoading = false;
      this.notifyListeners();
      console.error('Failed to load audio:', musicPath);
    });

    audio.addEventListener('abort', () => {
      this.isLoading = false;
      this.notifyListeners();
    });

    return audio;
  }

  private getOrCreateAudio(musicPath: string): HTMLAudioElement {
    if (!this.audioCache.has(musicPath)) {
      this.audioCache.set(musicPath, this.createAudio(musicPath));
    }
    return this.audioCache.get(musicPath)!;
  }

  setTheme(theme: string) {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;

    if (!(theme in THEME_MUSIC_MAP)) return;

    const musicPath = THEME_MUSIC_MAP[theme as keyof typeof THEME_MUSIC_MAP];

    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }

    this.currentAudio = this.getOrCreateAudio(musicPath);

    if (this.isPlaying) {
      this.loadAndPlay();
    }

    this.preloadOtherThemes();
  }

  private loadAndPlay() {
    if (!this.currentAudio) return;

    if (this.currentAudio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      this.currentAudio.play().catch(console.error);
    } else {
      this.currentAudio.src =
        this.currentAudio.src || this.getCurrentMusicPath();
      this.currentAudio.load();
    }
  }

  private getCurrentMusicPath(): string {
    if (!this.currentTheme || !(this.currentTheme in THEME_MUSIC_MAP)) {
      return THEME_MUSIC_MAP.default;
    }
    return THEME_MUSIC_MAP[this.currentTheme as keyof typeof THEME_MUSIC_MAP];
  }

  private preloadOtherThemes() {
    const preloadTask = () => {
      Object.values(THEME_MUSIC_MAP).forEach(musicPath => {
        if (!this.audioCache.has(musicPath)) {
          this.getOrCreateAudio(musicPath);
        }
      });
    };

    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(preloadTask, { timeout: 2000 });
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(preloadTask, 100);
    }
  }

  toggle() {
    this.isPlaying = !this.isPlaying;

    if (this.currentAudio) {
      if (this.isPlaying) {
        this.loadAndPlay();
      } else {
        this.currentAudio.pause();
      }
    }

    this.notifyListeners();
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      isLoading: this.isLoading,
    };
  }

  cleanup() {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
    this.listeners.clear();
  }
}

export function useBackgroundMusic() {
  const { theme } = useTheme();
  const [state, setState] = useState(() =>
    MusicManager.getInstance().getState()
  );

  useEffect(() => {
    const manager = MusicManager.getInstance();
    const unsubscribe = manager.addListener(() => {
      setState(manager.getState());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (theme) {
      MusicManager.getInstance().setTheme(theme);
    }
  }, [theme]);

  const toggleMusic = useCallback(() => {
    MusicManager.getInstance().toggle();
  }, []);

  return {
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    toggleMusic,
  };
}
