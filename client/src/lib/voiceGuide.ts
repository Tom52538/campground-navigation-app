export class VoiceGuide {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesLoaded: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeVoices();
  }

  private initializeVoices() {
    if (!this.synthesis) return;

    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        
        // Find the best English voice (prefer local service)
        this.preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith('en')
        ) || voices[0];

        console.log(`VoiceGuide: Loaded ${voices.length} voices, using:`, this.preferredVoice?.name);
      }
    };

    // Load immediately if available
    loadVoices();
    
    // Handle async voice loading
    this.synthesis.onvoiceschanged = loadVoices;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    this.stopCurrentSpeech();
  }

  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  private stopCurrentSpeech() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  speak(text: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    if (!this.isEnabled || !this.synthesis) return;

    try {
      // Cancel current speech for high priority
      if (priority === 'high') {
        this.stopCurrentSpeech();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.pitch = 1;
      utterance.lang = 'en-US';

      // Use preferred voice if available
      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        this.currentUtterance = utterance;
        console.log(`🔊 Navigation: "${text}"`);
      };

      utterance.onend = () => {
        this.currentUtterance = null;
      };

      utterance.onerror = (event) => {
        console.error('VoiceGuide error:', event.error);
        this.currentUtterance = null;
      };

      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('VoiceGuide speak error:', error);
    }
  }

  announceInstruction(instruction: string, distance: number) {
    if (distance > 0.1) { // >100m
      this.speak(`In ${Math.round(distance * 1000)} meters, ${instruction}`);
    } else if (distance > 0.02) { // 20-100m
      this.speak(`${instruction} ahead`, 'high');
    } else { // <20m
      this.speak(instruction, 'high');
    }
  }

  announceNavigationStart(firstInstruction: string) {
    this.speak(`Navigation started. ${firstInstruction}`, 'high');
  }

  announceOffRoute() {
    this.speak('You are off the planned route. Recalculating...', 'high');
  }

  announceDestinationReached() {
    this.speak('You have arrived at your destination', 'high');
  }

  announceRerouting() {
    this.speak('Route recalculated', 'high');
  }

  // Test voice functionality
  testVoice(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve(false);
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance('Voice test successful');
        utterance.volume = 1;
        utterance.rate = 0.8;
        
        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        this.synthesis.speak(utterance);
      } catch (error) {
        console.error('Voice test failed:', error);
        resolve(false);
      }
    });
  }

  // Get available voice information
  getVoiceInfo() {
    const voices = this.synthesis?.getVoices() || [];
    return {
      available: voices.length > 0,
      count: voices.length,
      preferred: this.preferredVoice?.name || 'None',
      supported: !!this.synthesis
    };
  }
}