// Sound System using Web Audio API
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.volume = 0.3; // Master volume
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    createSounds() {
        // Coin pickup sound - bright, twinkling
        this.sounds.coin = () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Bright coin sound with harmonics
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);

            gainNode.gain.setValueAtTime(this.volume * 0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            oscillator.start(now);
            oscillator.stop(now + 0.15);

            // Add harmonics for richer sound
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode2 = this.audioContext.createGain();

            oscillator2.connect(gainNode2);
            gainNode2.connect(this.audioContext.destination);

            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(1600, now);
            oscillator2.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

            gainNode2.gain.setValueAtTime(this.volume * 0.2, now);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            oscillator2.start(now);
            oscillator2.stop(now + 0.12);
        };

        // Sword swing sound - whoosh effect
        this.sounds.swordSwing = () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Create whoosh with noise and frequency sweep
            const bufferSize = this.audioContext.sampleRate * 0.15;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            // Generate white noise for whoosh
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);

            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(this.volume * 0.25, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            noise.start(now);
            noise.stop(now + 0.15);
        };

        // WoW-style level up sound - epic fanfare
        this.sounds.levelUp = () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;

            // Epic ascending notes
            const notes = [
                { freq: 523.25, time: 0, duration: 0.15 },     // C5
                { freq: 659.25, time: 0.12, duration: 0.15 },  // E5
                { freq: 783.99, time: 0.24, duration: 0.2 },   // G5
                { freq: 1046.5, time: 0.38, duration: 0.4 }    // C6 (higher octave)
            ];

            notes.forEach(note => {
                // Main tone with sine wave
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq, now + note.time);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                gain.gain.setValueAtTime(0, now + note.time);
                gain.gain.linearRampToValueAtTime(this.volume * 0.35, now + note.time + 0.02);
                gain.gain.setValueAtTime(this.volume * 0.35, now + note.time + note.duration - 0.1);
                gain.gain.linearRampToValueAtTime(0, now + note.time + note.duration);

                osc.start(now + note.time);
                osc.stop(now + note.time + note.duration);

                // Add harmonic for richness
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();

                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(note.freq * 2, now + note.time);

                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);

                gain2.gain.setValueAtTime(0, now + note.time);
                gain2.gain.linearRampToValueAtTime(this.volume * 0.15, now + note.time + 0.02);
                gain2.gain.linearRampToValueAtTime(0, now + note.time + note.duration);

                osc2.start(now + note.time);
                osc2.stop(now + note.time + note.duration);
            });

            // Shimmer effect
            for (let i = 0; i < 10; i++) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200 + Math.random() * 800, now + 0.4 + i * 0.05);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                gain.gain.setValueAtTime(this.volume * 0.08, now + 0.4 + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + i * 0.05);

                osc.start(now + 0.4 + i * 0.05);
                osc.stop(now + 0.6 + i * 0.05);
            }
        };

        // Material pickup sound - crystalline, slightly lower pitch
        this.sounds.material = () => {
            if (!this.audioContext) return;

            const now = this.audioContext.currentTime;
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Crystal-like sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.12);

            gainNode.gain.setValueAtTime(this.volume * 0.35, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

            oscillator.start(now);
            oscillator.stop(now + 0.18);

            // Add shimmer effect
            const oscillator2 = this.audioContext.createOscillator();
            const gainNode2 = this.audioContext.createGain();

            oscillator2.connect(gainNode2);
            gainNode2.connect(this.audioContext.destination);

            oscillator2.type = 'triangle';
            oscillator2.frequency.setValueAtTime(1200, now + 0.02);
            oscillator2.frequency.exponentialRampToValueAtTime(1800, now + 0.1);

            gainNode2.gain.setValueAtTime(this.volume * 0.15, now + 0.02);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            oscillator2.start(now + 0.02);
            oscillator2.stop(now + 0.15);
        };

        // Enemy death sounds - unique for each enemy type
        this.sounds.enemyDeathSlime = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Wet splat with gurgling collapse
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const noise = this.audioContext.createBufferSource();
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();
            const noiseGain = this.audioContext.createGain();

            // Create noise buffer for splat
            const bufferSize = this.audioContext.sampleRate * 0.3;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10);
            }
            noise.buffer = buffer;

            // Low gurgle
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(180, now);
            osc1.frequency.exponentialRampToValueAtTime(40, now + 0.4);

            // Wet squelch
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(320, now);
            osc2.frequency.exponentialRampToValueAtTime(80, now + 0.25);

            osc1.connect(gain1);
            osc2.connect(gain2);
            noise.connect(noiseGain);
            gain1.connect(this.audioContext.destination);
            gain2.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);

            gain1.gain.setValueAtTime(this.volume * 0.35, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            gain2.gain.setValueAtTime(this.volume * 0.25, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            noiseGain.gain.setValueAtTime(this.volume * 0.2, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc1.start(now);
            osc1.stop(now + 0.4);
            osc2.start(now);
            osc2.stop(now + 0.25);
            noise.start(now);
        };

        this.sounds.enemyDeathBat = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Shrieking death cry with flutter
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const osc3 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();
            const gain3 = this.audioContext.createGain();

            // High screech
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(1200, now);
            osc1.frequency.exponentialRampToValueAtTime(300, now + 0.3);

            // Mid flutter
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(800, now);
            osc2.frequency.setValueAtTime(600, now + 0.05);
            osc2.frequency.setValueAtTime(900, now + 0.1);
            osc2.frequency.setValueAtTime(500, now + 0.15);
            osc2.frequency.exponentialRampToValueAtTime(200, now + 0.25);

            // Low screech
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(600, now);
            osc3.frequency.exponentialRampToValueAtTime(150, now + 0.3);

            osc1.connect(gain1);
            osc2.connect(gain2);
            osc3.connect(gain3);
            gain1.connect(this.audioContext.destination);
            gain2.connect(this.audioContext.destination);
            gain3.connect(this.audioContext.destination);

            gain1.gain.setValueAtTime(this.volume * 0.2, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            gain2.gain.setValueAtTime(this.volume * 0.15, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

            gain3.gain.setValueAtTime(this.volume * 0.18, now);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc1.start(now);
            osc1.stop(now + 0.3);
            osc2.start(now);
            osc2.stop(now + 0.25);
            osc3.start(now);
            osc3.stop(now + 0.3);
        };

        this.sounds.enemyDeathSkeleton = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Bones collapsing and clattering
            const noise = this.audioContext.createBufferSource();
            const noiseGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Create noise buffer for bone clatter
            const bufferSize = this.audioContext.sampleRate * 0.5;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
            }
            noise.buffer = buffer;

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, now);
            filter.frequency.exponentialRampToValueAtTime(400, now + 0.5);
            filter.Q.value = 3;

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);

            noiseGain.gain.setValueAtTime(this.volume * 0.3, now);
            noiseGain.gain.setValueAtTime(this.volume * 0.25, now + 0.1);
            noiseGain.gain.setValueAtTime(this.volume * 0.2, now + 0.2);
            noiseGain.gain.setValueAtTime(this.volume * 0.15, now + 0.3);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            // Multiple bone hits
            for (let i = 0; i < 8; i++) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();

                osc.type = 'square';
                const freq = 150 + Math.random() * 200;
                osc.frequency.setValueAtTime(freq, now + i * 0.06);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + i * 0.06 + 0.08);

                osc.connect(gain);
                gain.connect(this.audioContext.destination);

                gain.gain.setValueAtTime(this.volume * (0.2 - i * 0.02), now + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.08);

                osc.start(now + i * 0.06);
                osc.stop(now + i * 0.06 + 0.08);
            }

            noise.start(now);
        };

        this.sounds.enemyDeathGolem = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Massive stone crumbling and crashing
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const noise = this.audioContext.createBufferSource();
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();
            const noiseGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Create noise for crumbling stone
            const bufferSize = this.audioContext.sampleRate * 0.7;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 3);
            }
            noise.buffer = buffer;

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(600, now);
            filter.frequency.exponentialRampToValueAtTime(150, now + 0.7);

            // Deep rumble
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(60, now);
            osc1.frequency.exponentialRampToValueAtTime(25, now + 0.6);

            // Mid-range crack
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(120, now);
            osc2.frequency.exponentialRampToValueAtTime(40, now + 0.5);

            osc1.connect(gain1);
            osc2.connect(gain2);
            noise.connect(filter);
            filter.connect(noiseGain);
            gain1.connect(this.audioContext.destination);
            gain2.connect(this.audioContext.destination);
            noiseGain.connect(this.audioContext.destination);

            gain1.gain.setValueAtTime(this.volume * 0.4, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

            gain2.gain.setValueAtTime(this.volume * 0.3, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            noiseGain.gain.setValueAtTime(this.volume * 0.35, now);
            noiseGain.gain.setValueAtTime(this.volume * 0.3, now + 0.2);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

            osc1.start(now);
            osc1.stop(now + 0.6);
            osc2.start(now);
            osc2.stop(now + 0.5);
            noise.start(now);
        };

        this.sounds.enemyDeathSpirit = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Haunting wail fading into void
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            const osc3 = this.audioContext.createOscillator();
            const gain1 = this.audioContext.createGain();
            const gain2 = this.audioContext.createGain();
            const gain3 = this.audioContext.createGain();

            // High wail
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(800, now);
            osc1.frequency.linearRampToValueAtTime(1200, now + 0.15);
            osc1.frequency.linearRampToValueAtTime(400, now + 0.35);
            osc1.frequency.exponentialRampToValueAtTime(100, now + 0.6);

            // Mid harmonic
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(600, now);
            osc2.frequency.linearRampToValueAtTime(900, now + 0.15);
            osc2.frequency.linearRampToValueAtTime(300, now + 0.35);
            osc2.frequency.exponentialRampToValueAtTime(80, now + 0.6);

            // Low rumble
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(200, now);
            osc3.frequency.linearRampToValueAtTime(300, now + 0.1);
            osc3.frequency.exponentialRampToValueAtTime(40, now + 0.5);

            osc1.connect(gain1);
            osc2.connect(gain2);
            osc3.connect(gain3);
            gain1.connect(this.audioContext.destination);
            gain2.connect(this.audioContext.destination);
            gain3.connect(this.audioContext.destination);

            // Wailing effect with tremolo
            gain1.gain.setValueAtTime(this.volume * 0.2, now);
            for (let i = 0; i < 10; i++) {
                const t = now + i * 0.06;
                gain1.gain.setValueAtTime(this.volume * 0.2, t);
                gain1.gain.linearRampToValueAtTime(this.volume * 0.15, t + 0.03);
            }
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

            gain2.gain.setValueAtTime(this.volume * 0.18, now);
            gain2.gain.linearRampToValueAtTime(0.01, now + 0.6);

            gain3.gain.setValueAtTime(this.volume * 0.15, now);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            osc1.start(now);
            osc1.stop(now + 0.6);
            osc2.start(now);
            osc2.stop(now + 0.6);
            osc3.start(now + 0.05);
            osc3.stop(now + 0.5);
        };

        // Player damage sound - subtle but noticeable impact
        this.sounds.playerDamage = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // Create a short, punchy impact sound with bass
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Deep thud with quick pitch drop
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.08);

            // Low-pass filter for "thump" quality
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            filter.Q.setValueAtTime(2, now);

            // Quick fade out for impact feel
            gainNode.gain.setValueAtTime(this.volume * 0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

            oscillator.start(now);
            oscillator.stop(now + 0.12);

            // Add a subtle high frequency "snap" for clarity
            const snapOsc = this.audioContext.createOscillator();
            const snapGain = this.audioContext.createGain();

            snapOsc.connect(snapGain);
            snapGain.connect(this.audioContext.destination);

            snapOsc.type = 'triangle';
            snapOsc.frequency.setValueAtTime(800, now);
            snapOsc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

            snapGain.gain.setValueAtTime(this.volume * 0.15, now);
            snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

            snapOsc.start(now);
            snapOsc.stop(now + 0.05);
        };
        // Player death sound - 8-bit "You Died" (Dark Souls style weight)
        this.sounds.playerDeath = () => {
            if (!this.audioContext) return;
            const now = this.audioContext.currentTime;

            // 1. The "Impact" - low, heavy noise burst
            const noise = this.audioContext.createBufferSource();
            const bufferSize = this.audioContext.sampleRate * 0.5;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5); // Decay
            }
            noise.buffer = buffer;

            const noiseFilter = this.audioContext.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(800, now);
            noiseFilter.frequency.linearRampToValueAtTime(100, now + 0.4);

            const noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(this.volume * 0.5, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            noise.start(now);

            // 2. The "Doom" Tone - Descending Sawtooth (The heavy "BWAAAAAAA")
            const bassOsc = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();
            const bassFilter = this.audioContext.createBiquadFilter();

            bassOsc.type = 'sawtooth';
            bassOsc.frequency.setValueAtTime(110, now); // Low A (A2)
            bassOsc.frequency.exponentialRampToValueAtTime(55, now + 1.5); // Drop to A1

            bassFilter.type = 'lowpass';
            bassFilter.frequency.setValueAtTime(1500, now);
            bassFilter.frequency.exponentialRampToValueAtTime(300, now + 1.5); // Closes down

            bassGain.gain.setValueAtTime(this.volume * 0.6, now);
            bassGain.gain.setValueAtTime(this.volume * 0.6, now + 0.5); // Sustain
            bassGain.gain.linearRampToValueAtTime(0, now + 2.0); // Long fade

            bassOsc.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(this.audioContext.destination);

            bassOsc.start(now);
            bassOsc.stop(now + 2.0);

            // 3. The "Discord" - Square wave harmony for 8-bit grit
            const squareOsc = this.audioContext.createOscillator();
            const squareGain = this.audioContext.createGain();

            squareOsc.type = 'square';
            squareOsc.frequency.setValueAtTime(82.41, now); // E2 (Tritone/Discordant interval)
            squareOsc.frequency.linearRampToValueAtTime(40, now + 1.5);

            squareGain.gain.setValueAtTime(this.volume * 0.3, now);
            squareGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

            squareOsc.connect(squareGain);
            squareGain.connect(this.audioContext.destination);

            squareOsc.start(now);
            squareOsc.stop(now + 1.5);
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Global sound manager instance
window.soundManager = new SoundManager();

// Background Music Manager - plays music1.mp3, music2.mp3, music3.mp3, music4.mp3 in sequence on loop
class MusicManager {
    constructor() {
        this.tracks = ['music1.mp3', 'music2.mp3', 'music3.mp3', 'music4.mp3'];
        this.currentTrackIndex = 0;
        this.audio = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.3;
        this.init();
    }

    init() {
        try {
            this.audio = new Audio();
            this.audio.volume = this.volume;

            // When a track ends, play the next one
            this.audio.addEventListener('ended', () => {
                this.playNextTrack();
            });
        } catch (e) {
            console.warn('Could not initialize music player', e);
        }
    }

    playBackgroundMusic() {
        if (!this.audio || this.isPlaying) return;

        this.currentTrackIndex = 0;
        this.playTrack(this.currentTrackIndex);
    }

    playTrack(index) {
        if (!this.audio) return;

        this.audio.src = this.tracks[index];
        this.audio.play().then(() => {
            this.isPlaying = true;
        }).catch(e => {
            console.warn('Could not play track:', this.tracks[index], e);
        });
    }

    playNextTrack() {
        if (!this.isPlaying) return;

        // Move to next track, loop back to first after last track
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        this.playTrack(this.currentTrackIndex);
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audio) {
            this.audio.volume = this.isMuted ? 0 : this.volume;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.audio) {
            this.audio.volume = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }
}

// Global music manager instance
window.musicManager = new MusicManager();
