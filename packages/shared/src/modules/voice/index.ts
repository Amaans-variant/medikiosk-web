import { VoiceService } from "../../services/voice/voiceService";

export class VoiceInputModule {
  public static playAudioPrompt(text: string, lang?: string) {
    VoiceService.speak(text, lang);
  }

  public static stopVoice() {
    VoiceService.stop();
  }
}
