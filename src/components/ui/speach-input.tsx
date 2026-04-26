'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MicIcon, LoaderIcon, SquareIcon } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

type SpeechInputMode = 'speech-recognition' | 'media-recorder' | 'none';

export interface SpeechInputProps {
  className?: string;
  onTranscriptionChange?: (text: string) => void;
  onAudioRecorded?: (audioBlob: Blob) => Promise<string>;
  lang?: string;
  size?: 'sm' | 'default' | 'lg';
}

const detectSpeechInputMode = (): SpeechInputMode => {
  if (typeof window === 'undefined') return 'none';

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    return 'speech-recognition';
  }

  if ('MediaRecorder' in window && navigator.mediaDevices) {
    return 'media-recorder';
  }

  return 'none';
};

export const SpeechInput = ({
  className,
  onTranscriptionChange,
  onAudioRecorded,
  lang = 'en-US',
  size = 'default',
}: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode] = useState<SpeechInputMode>(() => detectSpeechInputMode());

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // SpeechRecognition setup (Chrome, Edge)
  useEffect(() => {
    if (mode !== 'speech-recognition') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0]?.transcript ?? '';
        }
      }

      if (finalText) {
        onTranscriptionChange?.(finalText);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'network' && event.error !== 'not-allowed') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // eslint-disable-next-line consistent-return
    return () => {
      recognition.stop();
    };
  }, [mode, lang, onTranscriptionChange]);

  // MediaRecorder fallback (Safari, Firefox)
  const startMediaRecorder = useCallback(async () => {
    if (!onAudioRecorded) {
      console.warn('onAudioRecorded required for fallback');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        if (blob.size > 0) {
          setIsProcessing(true);
          try {
            const text = await onAudioRecorded(blob);
            if (text) onTranscriptionChange?.(text);
          } catch (e) {
            console.error(e);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      mediaRecorder.onerror = () => {
        setIsListening(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (e) {
      console.error('MediaRecorder error:', e);
    }
  }, [onAudioRecorded, onTranscriptionChange]);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (mode === 'speech-recognition') {
      if (isListening) {
        recognitionRef.current?.stop();
      } else {
        recognitionRef.current?.start();
      }
    } else if (mode === 'media-recorder') {
      if (isListening) {
        stopMediaRecorder();
      } else {
        startMediaRecorder();
      }
    }
  }, [mode, isListening, startMediaRecorder, stopMediaRecorder]);

  const isDisabled =
    mode === 'none' || (mode === 'media-recorder' && !onAudioRecorded) || isProcessing;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Pulse animation */}
      {isListening &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 animate-ping rounded-full border border-red-400/40"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '1.8s',
            }}
          />
        ))}

      <Button
        size={size}
        onClick={toggleListening}
        disabled={isDisabled}
        className={cn(
          'relative z-10 rounded-full transition-all duration-300',
          isListening
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/80',
          className
        )}
      >
        {isProcessing ? (
          <LoaderIcon className="size-4 animate-spin" />
        ) : isListening ? (
          <SquareIcon className="size-4" />
        ) : (
          <MicIcon className="size-4" />
        )}
      </Button>
    </div>
  );
};
