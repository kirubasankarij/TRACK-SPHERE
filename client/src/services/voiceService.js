class VoiceRecognitionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isActivated = false; // "TrackSphere" detected
        this.onStatusChange = null;
        this.onEmergencyDetected = null;
        this.wakeWord = "tracksphere";
        this.emergencyPhrases = ["help", "emergency", "heart attack", "accident", "sos"];

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
                
                console.log('Voice Transcript:', transcript);
                this.processTranscript(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech Recognition Error:', event.error);
                if (this.isListening) {
                    // Try to restart on certain errors
                    setTimeout(() => this.start(), 1000);
                }
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.recognition.start();
                }
            };
        } else {
            console.error('Web Speech API is not supported in this browser.');
        }
    }

    start(onStatusChange, onEmergencyDetected) {
        if (!this.recognition) return;
        this.onStatusChange = onStatusChange;
        this.onEmergencyDetected = onEmergencyDetected;
        this.isListening = true;
        this.isActivated = false;
        
        try {
            this.recognition.start();
            this.updateStatus();
        } catch (e) {
            console.warn('Recognition already started');
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isListening = false;
        this.isActivated = false;
        this.recognition.stop();
        this.updateStatus();
    }

    processTranscript(transcript) {
        // 1. Check for wake-word
        if (transcript.includes(this.wakeWord)) {
            this.isActivated = true;
            this.updateStatus();
            console.log('Wake-word detected! Listening for emergency phrases...');
            
            // Auto-deactivate after 10 seconds if no emergency phrase detected
            setTimeout(() => {
                if (this.isActivated) {
                    this.isActivated = false;
                    this.updateStatus();
                    console.log('Voice activation timed out.');
                }
            }, 10000);
        }

        // 2. If activated, check for emergency phrases
        if (this.isActivated) {
            const detectedPhrase = this.emergencyPhrases.find(phrase => transcript.includes(phrase));
            if (detectedPhrase) {
                console.log(`EMERGENCY DETECTED: ${detectedPhrase}`);
                if (this.onEmergencyDetected) {
                    this.onEmergencyDetected(detectedPhrase);
                }
                this.isActivated = false; // Reset after trigger
                this.updateStatus();
            }
        }
    }

    updateStatus() {
        if (this.onStatusChange) {
            let status = 'Off';
            if (this.isListening) status = 'Listening';
            if (this.isActivated) status = 'Activated';
            this.onStatusChange(status);
        }
    }
}

export default new VoiceRecognitionService();
