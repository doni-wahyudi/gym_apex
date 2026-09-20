import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { gymStore } from '../../services/gymStore';

interface CameraScannerModalProps {
  onClose: () => void;
  onScanSuccess: (memberCode: string) => void;
}

export const CameraScannerModal = ({ onClose, onScanSuccess }: CameraScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanning, setIsScanning] = useState(true);

  // Play crisp audio beep on successful scan using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch athletic beep (A5)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);

      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera device access is not supported on this browser.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        setCameraError(err.message || 'Unable to access camera.');
      }
    };

    if (isScanning) {
      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, isScanning]);

  const handleSimulateScan = (code: string) => {
    playBeep();
    setIsScanning(false);
    onScanSuccess(code);
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const members = gymStore.getMembers();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px', padding: 'var(--space-6)', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="badge badge-cyan">
              <Camera size={13} />
              Optical Sensor
            </span>
            <span className="badge badge-emerald">Live Video</span>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <h3 style={{ marginBottom: 'var(--space-2)' }}>Live Turnstile Video Scanner</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: 'var(--space-4)' }}>
          Position physical barcode ID card or member smartphone QR code within the target frame.
        </p>

        {/* Video Viewport Container */}
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '260px', 
            background: '#000', 
            borderRadius: 'var(--radius-xl)', 
            overflow: 'hidden',
            border: '2px solid var(--border-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}
        >
          {cameraError ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--color-amber)', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ margin: '0 auto var(--space-2)' }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Camera Stream Notice</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {cameraError}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-cyan)', marginTop: '8px' }}>
                You can still test real check-ins using the rapid simulation triggers below!
              </div>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                playsInline 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Scanning Target Reticle & Laser Sweep Animation */}
              <div 
                style={{ 
                  position: 'absolute', 
                  width: '180px', 
                  height: '180px', 
                  border: '2px solid var(--color-cyan)', 
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '2px', 
                    background: 'var(--color-cyan)',
                    boxShadow: '0 0 10px var(--color-cyan)',
                    animation: 'pulseGlow 1.5s infinite ease-in-out'
                  }} 
                />
              </div>

              {/* Corner accents */}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#fff' }}>
                Sensor: Active
              </div>
            </>
          )}
        </div>

        {/* Camera controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={toggleCamera}>
            <RefreshCw size={13} />
            Flip Camera ({facingMode === 'environment' ? 'Rear' : 'Front'})
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-detection enabled</span>
        </div>

        {/* Direct One-Click Simulation Triggers */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
            SIMULATE HARDWARE BARCODE SCANS:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {members.slice(0, 4).map((m) => (
              <button
                key={m.id}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleSimulateScan(m.memberCode)}
                style={{ fontSize: '0.78rem' }}
              >
                <CheckCircle2 size={13} color="var(--color-cyan)" />
                {m.fullName.split(' ')[0]} ({m.memberCode})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
