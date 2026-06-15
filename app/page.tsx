'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Mail, HeartHandshake, RefreshCw } from 'lucide-react';

// Sub-component: Falling/Floating SVG Hearts background
function FloatingHeartsBackground() {
  const [hearts, setHearts] = useState<{ id: number; left: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate a set of random decorative hearts for the background
    const items = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // random horizontal position (%)
      size: Math.random() * 20 + 10, // random size in px
      delay: Math.random() * 10, // delay in seconds
      duration: Math.random() * 10 + 8, // float duration in seconds
    }));
    
    // De-synchronize setState to prevent cascading render warnings
    const handle = requestAnimationFrame(() => {
      setHearts(items);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-rose-200/50"
          style={{
            left: `${heart.left}%`,
            bottom: `-5%`,
            width: heart.size,
            height: heart.size,
          }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            y: '-110vh',
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, 45, -45, 0],
            scale: [0.5, 1.2, 1, 0.8],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Sub-component: Confetti Canvas for standard celebration on acceptance
function CelebratoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      isHeart: boolean;
    }[] = [];

    const colors = [
      '#f43f5e', // rose-500
      '#ec4899', // pink-500
      '#d946ef', // fuchsia-500
      '#a855f7', // purple-500
      '#fb7185', // rose-400
      '#fda4af', // rose-300
    ];

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial particle generation
    const createParticle = (x: number, y: number, isInitial = false) => {
      const isHeart = Math.random() > 0.4;
      return {
        x: x,
        y: y,
        size: Math.random() * 12 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 8,
        speedY: isInitial ? -Math.random() * 12 - 4 : Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 5,
        isHeart: isHeart,
      };
    };

    // Spawn burst particles
    for (let i = 0; i < 150; i++) {
      particles.push(createParticle(window.innerWidth / 2, window.innerHeight * 0.6, true));
    }

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.quadraticCurveTo(x, y, x + size / 2, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + size / 3);
      ctx.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size);
      ctx.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3);
      ctx.quadraticCurveTo(x, y, x, y + size / 4);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Continuous trickle of top-down hearts
      if (particles.length < 200 && Math.random() > 0.3) {
        particles.push(createParticle(Math.random() * canvas.width, -20));
      }

      particles.forEach((p, index) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.speedY += 0.08; // gravity logic

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.isHeart) {
          drawHeart(ctx, -p.size / 2, -p.size / 2, p.size);
        } else {
          // Normal rectangular confetti banner
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();

        // Remove offscreen particles
        if (p.y > canvas.height + 20) {
          particles[index] = createParticle(Math.random() * canvas.width, -20);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" id="proposal-confetti-canvas" />;
}

// Funny custom lines when No button runs away
const NO_COMPULSORY_REJECTIONS = [
  "No 😢",
  "Wait, wrong click! 😜",
  "Are you absolutely sure? 🥺",
  "Error 404: Option Disabled! 🚫",
  "Too slow! Try again! 🏃‍♀️",
  "Look, a shooting star! 🌠 (moves away)",
  "Access Denied by Heartwall Sec! 🛡️",
  "Click YES instead! 👉👈",
  "Is your finger sliding? 🤨",
  "Love bypass activated! ⚡",
  "Incorrect Choice Pattern! 🛑",
  "My database says: No way! 💾",
  "Error: Love button out of bounds! 🤖",
  "Just click YES, pretty please? 🥰",
];

export default function ProposalApplication() {
  const [step, setStep] = useState<'name' | 'ask' | 'yes'>('name');
  const [userName, setUserName] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0, isRel: true, rotateMin: 0, rotateMax: 0 });
  const [noCount, setNoCount] = useState(0);
  const [rejectionMessage, setRejectionMessage] = useState("No");
  const [isClient, setIsClient] = useState(false);

  // Focus effect
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsClient(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  // Handle submit name
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setUserName(inputVal.trim());
      setStep('ask');
    }
  };

  // Teleportation generator for No button
  const triggerNoButtonTeleport = useCallback(() => {
    // Increment the amount of avoidance attempts
    const newCount = noCount + 1;
    setNoCount(newCount);

    // Pick a funny rejection line
    const randomIndex = Math.min(newCount - 1, NO_COMPULSORY_REJECTIONS.length - 1);
    // Mix randomly after simple progression runs out
    const msg = newCount <= NO_COMPULSORY_REJECTIONS.length 
      ? NO_COMPULSORY_REJECTIONS[newCount - 1] 
      : NO_COMPULSORY_REJECTIONS[Math.floor(Math.random() * NO_COMPULSORY_REJECTIONS.length)];

    setRejectionMessage(msg);

    // Calculate dynamic safe boundary placements (15% to 80% to fit nicely inside the screen viewport safely)
    const randomPercentX = Math.floor(Math.random() * 65) + 15; // 15% - 80%
    const randomPercentY = Math.floor(Math.random() * 65) + 15; // 15% - 80%

    // Precalculate random rotation bounds inside callback (not during render phase)
    const rotMin = Math.random() * -12 - 4;
    const rotMax = Math.random() * 12 + 4;

    setNoButtonPosition({
      x: randomPercentX,
      y: randomPercentY,
      isRel: false,
      rotateMin: rotMin,
      rotateMax: rotMax,
    });
  }, [noCount]);

  // Calculate increasing size of Yes button dynamically to add sweet humor
  const yesScale = 1 + noCount * 0.18;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#fdf5f7] flex items-center justify-center font-serif-proposal text-[#5c4044]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b81]" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fdf5f7] text-[#5c4044] font-serif-proposal px-4 py-8 select-none">
      {/* Decorative Vertical Text (Artistic Flair signature) */}
      <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] opacity-40 [writing-mode:vertical-rl] rotate-180 select-none pointer-events-none hidden sm:block">
        A Special Proposal &bull; Eternal Devotion &bull; MMXXVI
      </div>

      {/* Background Hearts */}
      <FloatingHeartsBackground />

      {/* Decorative Ornaments to establish romantic & cozy mood */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/75 backdrop-blur-sm border border-pink-100 px-3.5 py-1.5 rounded-full text-xs text-[#ff6b81] font-sans font-bold uppercase tracking-wider shadow-sm animate-float">
          <Heart className="w-3.5 h-3.5 fill-[#ff6b81] stroke-[#ff6b81] animate-ping" />
          <span>Made with Love</span>
        </div>
      </div>

      {/* Soft Radial Accents (Artistic Flair signature overlays) */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-red-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Name Input (Artistic Style with ❦ and bottom-border-highlight) */}
        {step === 'name' && (
          <motion.div
            key="name-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full max-w-[520px] bg-white rounded-[48px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-12 text-center border border-pink-100 z-10 relative overflow-hidden"
            id="proposal-name-entry-card"
          >
            <div className="flex flex-col items-center">
              <div className="text-pink-300 text-5xl mb-6 font-serif-proposal select-none">❦</div>

              <h1 className="text-3xl font-light tracking-tight text-[#5c4044] mb-2 font-serif-proposal leading-tight">
                Whom is this for?
              </h1>
              <p className="text-xs text-pink-400 uppercase tracking-widest font-sans font-bold mb-8">
                Enter your name below
              </p>

              <form onSubmit={handleNameSubmit} className="w-full space-y-8">
                <div className="relative group max-w-sm mx-auto">
                  <input
                    type="text"
                    required
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    maxLength={25}
                    placeholder="Enter name..."
                    className="w-full bg-transparent border-b-2 border-pink-100 py-4 text-center text-2xl focus:outline-none focus:border-pink-300 transition-colors placeholder:text-pink-100 text-[#ff6b81] font-serif-proposal italic"
                    id="crush-name-input"
                    autoComplete="off"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#ff6b81] group-focus-within:w-full transition-all duration-500 rounded-full"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-10 py-4 bg-[#ff6b81] text-white rounded-full text-sm font-sans font-bold uppercase tracking-widest hover:bg-[#ff4d63] transition-all transform shadow-md shadow-pink-100 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                  id="open-letter-button"
                >
                  <span>Open Message 💌</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP 2: The Proposal Page */}
        {step === 'ask' && (
          <motion.div
            key="ask-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-[520px] bg-white rounded-[48px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-12 text-center border border-pink-100 z-10 relative min-h-[460px] flex flex-col justify-between"
            id="proposal-ask-card"
          >
            <div className="space-y-6">
              {/* Decorative premium floral style */}
              <div className="text-pink-300 text-5xl mb-2 font-serif-proposal select-none">❦</div>

              {/* Greeting section */}
              <div className="space-y-4">
                <p className="text-pink-400 font-bold tracking-widest text-xs font-sans uppercase">
                  Sweet Message to {userName} ✨
                </p>
                <h2 className="text-4xl text-[#5c4044] leading-tight font-serif-proposal font-light" id="proposal-question-title">
                  Will you be my girlfriend, <br />
                  <span className="text-[#ff6b81] font-bold italic block mt-1">{userName}</span>?
                </h2>
                <p className="text-[#5c4044]/70 font-serif-proposal text-sm max-w-sm mx-auto leading-relaxed">
                  You make my world beautiful. Please grant me the joy of holding your hand forever. 💖
                </p>
              </div>
            </div>

            {/* Funny counts */}
            {noCount > 0 && (
              <motion.div 
                key={noCount}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 text-xs font-sans font-bold uppercase tracking-wider px-4 py-1.5 bg-rose-50 border border-pink-100 rounded-full text-[#ff6b81] inline-block mx-auto shadow-sm"
              >
                Attempts to escape: {noCount} 🏃‍♀️
              </motion.div>
            )}

            {/* Interactive Decision Making Area */}
            <div className="relative mt-8 min-h-[140px] flex items-center justify-center gap-6 flex-wrap">
              {/* YES BUTTON (Artistic Pink) */}
              <motion.button
                onClick={() => setStep('yes')}
                style={{ scale: yesScale }}
                className="px-12 py-4 bg-[#ff6b81] text-white rounded-full font-sans font-bold uppercase tracking-widest shadow-lg shadow-pink-200 hover:bg-[#ff4d63] transition-all z-20 cursor-pointer flex items-center gap-2 relative select-none"
                id="proposal-yes-button"
                whileHover={{ scale: yesScale * 1.05 }}
                whileTap={{ scale: yesScale * 0.95 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                <Heart className="w-4 h-4 fill-white stroke-white animate-pulse" />
                <span>YES ❤️</span>
              </motion.button>

              {/* NO BUTTON (Dynamic Teleporter with Custom Outline Style) */}
              <motion.button
                onPointerDown={triggerNoButtonTeleport}
                onMouseEnter={triggerNoButtonTeleport}
                onClick={(e) => {
                  e.preventDefault();
                  triggerNoButtonTeleport();
                }}
                className={`px-10 py-4 border border-pink-200 text-pink-300 rounded-full font-sans font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer select-none ${
                  noButtonPosition.isRel 
                    ? 'relative z-10 bg-white hover:text-[#ff6b81] hover:border-pink-300' 
                    : 'fixed z-[999] shadow-2xl bg-white/95 ring-4 ring-pink-100 text-[#ff6b81] border-[#ff6b81]'
                }`}
                style={
                  noButtonPosition.isRel
                    ? undefined
                    : {
                        left: `${noButtonPosition.x}%`,
                        top: `${noButtonPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }
                }
                id="proposal-no-button"
                animate={
                  noButtonPosition.isRel 
                    ? { y: [0, -3, 0] } 
                    : { 
                        scale: [0.8, 1.05, 1],
                        rotate: [noButtonPosition.rotateMin, noButtonPosition.rotateMax, 0] 
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 15,
                  y: { type: "tween", duration: 0.4, ease: "easeInOut" },
                  scale: { type: "tween", duration: 0.25, ease: "easeOut" },
                  rotate: { type: "tween", duration: 0.25, ease: "easeOut" }
                }}
              >
                <span>{rejectionMessage}</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Yes! Accepted State */}
        {step === 'yes' && (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full max-w-[600px] bg-white rounded-[48px] shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-12 text-center border border-pink-100 z-10 relative overflow-hidden"
            id="proposal-success-card"
          >
            {/* Real Canvas Hearts Explosion Layer */}
            <CelebratoryCanvas />

            <div className="flex flex-col items-center space-y-6 relative z-10">
              
              <div className="text-7xl animate-bounce select-none">❤️</div>

              {/* Main Greeting response exactly fitting "I love you <Name> ❤️" */}
              <div className="space-y-4">
                <h2 className="text-4xl text-[#5c4044] font-serif-proposal leading-tight" id="proposal-success-title">
                  I love you, <span className="text-[#ff6b81] font-bold italic">{userName}</span>!
                </h2>
                <p className="text-pink-400 italic font-serif-proposal text-lg">
                  Forever and always yours. 💕
                </p>
              </div>

              {/* Cute GIF layout: Bouncing Couple GIF dynamically embedded beautifully */}
              <div className="mt-4 w-full max-w-[325px] rounded-3xl overflow-hidden border-8 border-white shadow-xl aspect-square relative bg-pink-50">
                {/* Embedded adorable interactive hugging couple sticker GIF */}
                <img 
                  src="/gif1.gif"
                  alt="Hugging Couple"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              </div>

              {/* Restart button to try again for fun with Artistic style */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setStep('name');
                  setNoCount(0);
                  setNoButtonPosition({ x: 0, y: 0, isRel: true, rotateMin: 0, rotateMax: 0 });
                  setRejectionMessage("No");
                  setInputVal('');
                }}
                className="mt-6 px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider border border-pink-200 text-[#ff6b81] rounded-full cursor-pointer hover:bg-pink-50/50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Start Over?</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Decorative Hearts bottom right (Artistic Flair signature) */}
      <div className="absolute bottom-10 right-10 flex gap-4 opacity-20 pointer-events-none text-2xl">
        <div className="animate-float" style={{ animationDelay: '0s' }}>❤️</div>
        <div className="animate-float" style={{ animationDelay: '1s' }}>💖</div>
        <div className="animate-float" style={{ animationDelay: '2s' }}>💕</div>
      </div>
    </main>
  );
}
