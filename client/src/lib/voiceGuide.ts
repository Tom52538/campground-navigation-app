import { detectBrowserLanguage, voiceInstructions, SupportedLanguage } from './i18n';
import { detectUserLanguage } from './languageDetection';

export class VoiceGuide {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voicesLoaded: boolean = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private currentLanguage: SupportedLanguage;
  private announcementQueue: Array<{text: string, priority: 'low' | 'medium' | 'high'}> = [];
  private isSpeaking: boolean = false;
  private voiceLanguageMap: { [key: string]: string } = {
    'de': 'de-DE',    // German (Germany)
    'en': 'en-US',    // English (US)
    'fr': 'fr-FR',    // French (France)
    'es': 'es-ES',    // Spanish (Spain)
    'it': 'it-IT',    // Italian (Italy)
    'nl': 'nl-NL',    // Dutch (Netherlands)
    'pt': 'pt-PT',    // Portuguese (Portugal)
    'pl': 'pl-PL',    // Polish (Poland)
    'ru': 'ru-RU',    // Russian (Russia)
    'cs': 'cs-CZ',    // Czech (Czech Republic)
    'hu': 'hu-HU'     // Hungarian (Hungary)
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.currentLanguage = detectUserLanguage() as SupportedLanguage;
    console.log(`🎙️ Voice guidance language: ${this.currentLanguage}`);
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
    console.log(`🔄 Voice language changed to: ${language}`);
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
    // Use the enhanced voice language mapping
    const speechLang = this.voiceLanguageMap[this.currentLanguage] || 'en-US';
    console.log(`🗣️ Speech synthesis language: ${speechLang} for ${this.currentLanguage}`);
    return speechLang;
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

  private processQueue() {
    if (this.isSpeaking || this.announcementQueue.length === 0 || !this.isEnabled) {
      return;
    }

    this.isSpeaking = true;
    const announcement = this.announcementQueue.shift()!;
    const translatedText = this.translateInstruction(announcement.text);
    
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.rate = 0.9;
    utterance.volume = 1;
    utterance.pitch = 1;
    utterance.lang = this.getLanguageCode();

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      console.log(`🔊 Navigation: "${announcement.text}" (${announcement.priority})`);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.processQueue(); // Process next item in queue
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.processQueue(); // Try next item on error
    };

    this.synthesis.speak(utterance);
  }

  speak(text: string, priority: 'low' | 'medium' | 'high' = 'medium') {
    if (!this.isEnabled || !this.synthesis) return;

    try {
      if (priority === 'high') {
        // High priority: clear queue and current speech
        this.synthesis.cancel();
        this.announcementQueue = [];
        this.isSpeaking = false;
        this.announcementQueue.push({ text, priority });
      } else {
        // Add to queue
        this.announcementQueue.push({ text, priority });
      }
      
      this.processQueue();
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

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
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