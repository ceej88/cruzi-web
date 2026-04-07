import { useRef, useState, useCallback, useEffect } from 'react';

interface UseNeuralPulseReturn {
  audioLevel: number;
  isPlaying: boolean;
  startPulse: () => void;
  stopPulse: () => void;
  simulatePulse: () => void;
  stopSimulation: () => void;
  connectAnalyser: (analyser: AnalyserNode) => void;
  disconnectAnalyser: () => void;
}

/**
 * Neural Pulse Engine - Real-time audio analysis for reactive UI
 * Uses Web Audio API to sample frequency data at 60fps
 * 
 * Tuned for Rachel's voice (higher frequency female voice):
 * - Focuses on 200Hz-4kHz range where female speech is strongest
 * - Uses weighted averaging to emphasize speech frequencies
 * - Smooth transitions for elegant visual response
 */
export const useNeuralPulse = (): UseNeuralPulseReturn => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // THE PULSE ENGINE - Core frequency analysis loop
  // Optimised for female voice frequencies (Rachel)
  const updatePulse = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // For female voice (Rachel), emphasize mid-high frequencies
    // Bins 10-60 roughly cover 400Hz-2.5kHz at 44.1kHz sample rate
    const speechBins = dataArray.slice(10, 60);
    const average = speechBins.reduce((a, b) => a + b, 0) / speechBins.length;
    
    // Normalize and apply slight boost for responsiveness
    const normalizedLevel = Math.min((average / 128) * 1.2, 1);

    // Smooth the transition for organic feel
    setAudioLevel(prev => prev * 0.6 + normalizedLevel * 0.4);

    animationFrameRef.current = requestAnimationFrame(updatePulse);
  }, []);

  // Connect an external AnalyserNode (from audio playback)
  const connectAnalyser = useCallback((analyser: AnalyserNode) => {
    analyserRef.current = analyser;
    setIsPlaying(true);
    animationFrameRef.current = requestAnimationFrame(updatePulse);
  }, [updatePulse]);

  // Disconnect the analyser
  const disconnectAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    analyserRef.current = null;
    setIsPlaying(false);
    setAudioLevel(0);
  }, []);

  // Start the pulse engine (legacy - for internal analyser)
  const startPulse = useCallback(() => {
    setIsPlaying(true);
    animationFrameRef.current = requestAnimationFrame(updatePulse);
  }, [updatePulse]);

  // Stop the pulse engine
  const stopPulse = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
    setAudioLevel(0);
  }, []);

  // Simulate pulse for when audio is not available (fallback)
  const simulatePulse = useCallback(() => {
    setIsPlaying(true);
    
    const simulate = () => {
      // Create organic breathing pattern
      const time = Date.now() / 1000;
      const baseLevel = 0.3 + Math.sin(time * 2) * 0.15;
      const variance = Math.random() * 0.2;
      const level = Math.min(baseLevel + variance, 1);
      
      setAudioLevel(level);
    };

    simulate();
    simulationRef.current = setInterval(simulate, 50);
  }, []);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsPlaying(false);
    setAudioLevel(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPulse();
      stopSimulation();
    };
  }, [stopPulse, stopSimulation]);

  return {
    audioLevel,
    isPlaying,
    startPulse,
    stopPulse,
    simulatePulse,
    stopSimulation,
    connectAnalyser,
    disconnectAnalyser,
  };
};
