import React, { useEffect, useRef, useState } from 'react';

const AuraBackground = () => {
  const followerRef = useRef(null);
  const rippleRef = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [auraBoost, setAuraBoost] = useState(false);
  const auraBoostTimer = useRef(null);
  
  // Spring-like lerp setup
  const mouse = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
  const blobPos = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });

  // 1. DOM interactions (Hover logic & Aura Blob Pulse)
  useEffect(() => {
    const handleMouseOver = (e) => {
      // Find nearest interactive element up the tree
      const target = e.target.closest('a, button, [role="button"], .bento-card');
      if (target) {
        setIsHovering(true);
        // Mild Context awareness
        const text = target.textContent?.toLowerCase() || '';
        if (text.includes('urgent') || target.classList.contains('urgent') || target.classList.contains('btn-danger') || text.includes('resolved') || target.classList.contains('issue-status-tag')) {
          // Note: Bloom effect triggers visually on canvas, we just need a slight aura tint here
          setIsUrgent(text.includes('urgent') || target.classList.contains('btn-danger') || target.classList.contains('urgent'));
        } else {
          setIsUrgent(false);
        }
      } else {
        setIsHovering(false);
        setIsUrgent(false);
      }
    };
    
    const handleMouseDown = (e) => {
      if (rippleRef.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ripple = rippleRef.current;
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        ripple.classList.remove('ripple-animate');
        // Force DOM reflow to restart animation reliably
        void ripple.offsetWidth;
        ripple.classList.add('ripple-animate');
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);

    // Apply-sparkle aura boost
    const handleAuraBoost = () => {
      setAuraBoost(true);
      if (auraBoostTimer.current) clearTimeout(auraBoostTimer.current);
      auraBoostTimer.current = setTimeout(() => setAuraBoost(false), 800);
    };
    window.addEventListener('apply-aura-boost', handleAuraBoost);

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('apply-aura-boost', handleAuraBoost);
    };
  }, []);

  // 2. Motion System (Living impact aura follower)
  useEffect(() => {
    let animationFrame;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    const animateLoop = () => {
      // Move Aura Follower Blob
      if (!prefersReducedMotion) {
        blobPos.current.x += (mouse.current.x - blobPos.current.x) * 0.04; 
        blobPos.current.y += (mouse.current.y - blobPos.current.y) * 0.04;
        
        if (followerRef.current) {
          followerRef.current.style.transform = `translate(${blobPos.current.x}px, ${blobPos.current.y}px)`;
        }
      }

      animationFrame = requestAnimationFrame(animateLoop);
    };

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    animationFrame = requestAnimationFrame(animateLoop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="aura-container">
      {/* Layer 1: Living Impact Aura (Pulse & Blob) */}
      <div ref={rippleRef} className="aura-ripple" />
      <div ref={followerRef} className="aura-follower">
        <div className="aura-breather">
          <div className={`aura-blob ${isHovering || auraBoost ? 'hover-expand' : ''} ${isUrgent ? 'urgent-tone' : ''} ${auraBoost ? 'aura-boost-active' : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default AuraBackground;
