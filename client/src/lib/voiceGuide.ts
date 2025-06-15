import { detectBrowserLanguage, voiceInstructions, SupportedLanguage } from './i18n';

export class VoiceGuide {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesLoaded: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private currentLanguage: SupportedLanguage;
  private announcementQueue: Array<{text: string, priority: 'low' | 'medium' | 'high'}> = [];
  private isSpeaking: boolean = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.currentLanguage = detectBrowserLanguage();
    this.initializeVoices();
  }

  private initializeVoices() {
    if (!this.synthesis) return;

    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        
        // Find the best voice for current language (prefer local service)
        const languageCode = this.currentLanguage;
        this.preferredVoice = voices.find(voice => 
          voice.lang.toLowerCase().startsWith(languageCode) && voice.localService
        ) || voices.find(voice => 
          voice.lang.toLowerCase().startsWith(languageCode)
        ) || voices.find(voice => 
          voice.lang.toLowerCase().includes('en') && voice.localService
        ) || voices[0];

        console.log(`VoiceGuide: Loaded ${voices.length} voices, using:`, this.preferredVoice?.name);
      }
    };

    // Load immediately if available
    loadVoices();
    
    // Handle async voice loading
    this.synthesis.onvoiceschanged = loadVoices;
  }

  setLanguage(language: SupportedLanguage) {
    this.currentLanguage = language;
    this.initializeVoices();
  }

  private translateInstruction(instruction: string): string {
    const instructions = voiceInstructions[this.currentLanguage];
    
    // Map common navigation instructions to translated versions
    const instructionMap: Record<string, keyof typeof instructions> = {
      'turn left': 'turnLeft',
      'turn right': 'turnRight',
      'turn slight left': 'turnSlightLeft',
      'turn slight right': 'turnSlightRight',
      'turn sharp left': 'turnSharpLeft',
      'turn sharp right': 'turnSharpRight',
      'continue ahead': 'continueAhead',
      'continue straight': 'continueStraight',
      'keep left': 'keepLeft',
      'keep right': 'keepRight',
      'head north': 'headNorth',
      'head south': 'headSouth',
      'head east': 'headEast',
      'head west': 'headWest',
      'head northeast': 'headNortheast',
      'head northwest': 'headNorthwest',
      'head southeast': 'headSoutheast',
      'head southwest': 'headSouthwest',
      'arrive at your destination': 'arrive'
    };

    const lowerInstruction = instruction.toLowerCase();
    
    // Find matching instruction
    for (const [key, translationKey] of Object.entries(instructionMap)) {
      if (lowerInstruction.includes(key)) {
        return instructions[translationKey];
      }
    }
    
    // Return original if no translation found
    return instruction;
  }

  private getLanguageCode(): string {
    const languageMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      de: 'de-DE',
      fr: 'fr-FR',
      nl: 'nl-NL',
      it: 'it-IT',
      es: 'es-ES'
    };
    return languageMap[this.currentLanguage] || 'en-US';
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

      // Translate the text to current language
      const translatedText = this.translateInstruction(text);
      
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.pitch = 1;
      utterance.lang = this.getLanguageCode();

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