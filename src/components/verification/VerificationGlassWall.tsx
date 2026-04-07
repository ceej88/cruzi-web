import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, Camera, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, X, Eye } from 'lucide-react';
import { InstructorProfile } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationGlassWallProps {
  initialProfile: InstructorProfile;
  onVerified: (updates: Partial<InstructorProfile>) => void;
  onExit: () => void;
}

interface VerificationResult {
  isGenuine: boolean;
  confidenceScore: number;
  adiNumber: string | null;
  fullName: string | null;
  expiryDate: string | null;
  warnings: string[];
}

const VerificationGlassWall: React.FC<VerificationGlassWallProps> = ({
  initialProfile,
  onVerified,
  onExit
}) => {
  const [step, setStep] = useState<'identity' | 'capture' | 'review'>('identity');
  const [email, setEmail] = useState('');
  const [adiNumber, setAdiNumber] = useState(initialProfile.adiNumber || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }
    
    setImageFile(file);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleVerification = async () => {
    if (!imageFile || !imagePreview) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      // Convert to base64 for the edge function
      const base64 = imagePreview.split(',')[1];
      
      const { data, error: fnError } = await supabase.functions.invoke('verify-adi-badge', {
        body: { 
          image: base64,
          declaredAdiNumber: adiNumber,
          declaredName: initialProfile.name
        }
      });
      
      if (fnError) throw fnError;
      
      const result = data as VerificationResult;
      setVerificationResult(result);
      
      if (result.confidenceScore >= 75) {
        // Success - update profile and shatter the wall
        setTimeout(() => {
          onVerified({
            isVerified: true,
            verificationStatus: 'VERIFIED',
            verificationScore: result.confidenceScore,
            adiExpiryDate: result.expiryDate || undefined
          });
          
          toast({
            title: "Verification Complete",
            description: `Welcome to the Neural Command Hub, ${initialProfile.name}.`,
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderIdentityStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity Declaration</h2>
        <p className="text-slate-500 font-medium">Confirm your professional credentials</p>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Professional Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            ADI Number (as shown on badge)
          </label>
          <input
            type="text"
            value={adiNumber}
            onChange={(e) => setAdiNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            maxLength={6}
            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-2xl text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 transition-all tabular-nums tracking-widest"
          />
        </div>
      </div>
      
      <button
        onClick={() => setStep('capture')}
        disabled={!email || adiNumber.length !== 6}
        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue to Badge Upload
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );

  const renderCaptureStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/30">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vision Capture</h2>
        <p className="text-slate-500 font-medium">Upload your Official Green ADI Badge</p>
      </div>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer ${
          imagePreview 
            ? 'border-emerald-300 bg-emerald-50' 
            : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
        
        {imagePreview ? (
          <div className="space-y-4">
            <img 
              src={imagePreview} 
              alt="Badge preview" 
              className="max-h-48 mx-auto rounded-2xl shadow-lg"
            />
            <p className="text-center text-sm font-bold text-emerald-600">
              Badge captured successfully
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-700">Drop image here or tap to upload</p>
              <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          onClick={() => setStep('identity')}
          className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => setStep('review')}
          disabled={!imageFile}
          className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Neural Review
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xl transition-all ${
          verificationResult?.confidenceScore && verificationResult.confidenceScore >= 75
            ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30'
            : isVerifying
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30 animate-pulse'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30'
        }`}>
          {isVerifying ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : verificationResult?.confidenceScore && verificationResult.confidenceScore >= 75 ? (
            <CheckCircle className="w-10 h-10 text-white" />
          ) : (
            <Eye className="w-10 h-10 text-white" />
          )}
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {isVerifying ? 'Neural Scan Active...' : verificationResult ? 'Verification Complete' : 'Neural Review'}
        </h2>
        <p className="text-slate-500 font-medium">
          {isVerifying 
            ? 'Analyzing badge authenticity patterns...'
            : verificationResult 
            ? `Confidence Score: ${verificationResult.confidenceScore}%`
            : 'AI verification of your ADI badge'
          }
        </p>
      </div>
      
      {verificationResult && (
        <div className={`p-6 rounded-3xl border-2 ${
          verificationResult.confidenceScore >= 75
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            {verificationResult.confidenceScore >= 75 ? (
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <p className={`font-black text-lg ${
                verificationResult.confidenceScore >= 75 ? 'text-emerald-800' : 'text-amber-800'
              }`}>
                {verificationResult.confidenceScore >= 75 ? 'Badge Verified' : 'Verification Uncertain'}
              </p>
              <p className={`text-sm font-medium ${
                verificationResult.confidenceScore >= 75 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {verificationResult.confidenceScore >= 75 
                  ? 'Your identity has been confirmed'
                  : 'Please try with a clearer image'
                }
              </p>
            </div>
          </div>
          
          {verificationResult.adiNumber && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Detected ADI</p>
                <p className="font-black text-slate-900">{verificationResult.adiNumber}</p>
              </div>
              {verificationResult.expiryDate && (
                <div>
                  <p className="text-slate-500 font-medium">Expires</p>
                  <p className="font-black text-slate-900">{verificationResult.expiryDate}</p>
                </div>
              )}
            </div>
          )}
          
          {verificationResult.warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Warnings</p>
              <ul className="text-sm text-amber-600 space-y-1">
                {verificationResult.warnings.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {!verificationResult && !isVerifying && (
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center space-y-4">
          <img 
            src={imagePreview || ''} 
            alt="Badge to verify" 
            className="max-h-32 mx-auto rounded-xl shadow-md"
          />
          <p className="text-sm text-slate-500 font-medium">
            Ready to analyze your ADI badge using neural vision AI
          </p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      <div className="flex gap-4">
        {!verificationResult && (
          <>
            <button
              onClick={() => setStep('capture')}
              disabled={isVerifying}
              className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleVerification}
              disabled={isVerifying}
              className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Begin Verification
                </>
              )}
            </button>
          </>
        )}
        
        {verificationResult && verificationResult.confidenceScore < 75 && (
          <button
            onClick={() => {
              setVerificationResult(null);
              setImageFile(null);
              setImagePreview(null);
              setStep('capture');
            }}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 to-slate-800/80 backdrop-blur-sm" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-lg mx-4 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-slate-900 tracking-tight">Neural Verification</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zero-Trust Protocol</p>
            </div>
          </div>
          <button
            onClick={onExit}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-center gap-2">
          {['identity', 'capture', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-3 h-3 rounded-full transition-all ${
                step === s 
                  ? 'bg-indigo-600 scale-125' 
                  : ['identity', 'capture', 'review'].indexOf(step) > i
                  ? 'bg-emerald-500'
                  : 'bg-slate-200'
              }`} />
              {i < 2 && (
                <div className={`w-12 h-0.5 transition-all ${
                  ['identity', 'capture', 'review'].indexOf(step) > i
                    ? 'bg-emerald-500'
                    : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {step === 'identity' && renderIdentityStep()}
            {step === 'capture' && renderCaptureStep()}
            {step === 'review' && renderReviewStep()}
          </AnimatePresence>
          
          {/* Dev bypass - triple tap the shield text to skip */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                onVerified({
                  isVerified: true,
                  verificationStatus: 'VERIFIED',
                  verificationScore: 100,
                });
              }}
              className="text-[9px] text-slate-300 hover:text-cruzi-indigo font-medium transition-colors"
            >
              Skip verification (Demo Mode)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationGlassWall;
