'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  FaPhoneAlt,
  FaMobileAlt,
  FaPhone,
  FaSms,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHashtag,
  FaUserFriends,
  FaUsers,
  FaVideo,
  FaGlobe,
  FaSyncAlt,
  FaArrowLeft,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaGithub,
  FaCalendarAlt,
} from 'react-icons/fa';

const ContactCard = ({ cardData, index = 0, isActive = false, onClick, totalCards = 3, activeCardIndex = 0 }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const touchStartRef = useRef(null);
  const isSwipingRef = useRef(false);
  const mouseMoveHandlerRef = useRef(null);
  const mouseUpHandlerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % cardData.slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [cardData.slides.length]);

  const getBaseTransform = () => {
    // For Apple Wallet style, we don't need base rotations
    return '';
  };

  const handleFlip = () => {
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Reset any inline transforms before flipping
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
      cardRef.current.style.transform = getBaseTransform();
    }
    if (frontRef.current) {
      frontRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
      frontRef.current.style.transform = '';
    }
    if (backRef.current) {
      backRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
      backRef.current.style.transform = '';
    }
    
    setIsFlipped((prev) => !prev);
    
    // Add parallax effect during flip animation
    if (cardRef.current) {
      const baseTransform = getBaseTransform();
      // Animate to max depth at 90deg, then back
      const animateParallax = () => {
        const startTime = Date.now();
        const duration = 800;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Sin wave for smooth in/out
          const parallaxDepth = Math.sin(progress * Math.PI) * 50;
          
          if (cardRef.current) {
            cardRef.current.style.transform = `${baseTransform} translateZ(${parallaxDepth}px)`;
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Reset after animation
            if (cardRef.current) {
              cardRef.current.style.transform = baseTransform;
            }
          }
        };
        
        requestAnimationFrame(animate);
      };
      
      animateParallax();
    }
  };

  const handleTouchStart = (e) => {
    // Don't start swipe if touching interactive elements
    const target = e.target;
    if (target.closest('button') || target.closest('a') || target.closest('.social-icon') || target.closest('.indicator')) {
      return;
    }
    
    if (e.touches.length !== 1) return;
    
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const distance = Math.abs(deltaX);
    
    // Start swiping after 10px movement
    if (distance > 10) {
      isSwipingRef.current = true;
    }
    
    if (!isSwipingRef.current || !frontRef.current || !backRef.current) return;

    // Calculate rotation based on swipe distance from start
    // Max rotation is 180 degrees, threshold is about 150px
    const maxDistance = 150;
    const baseRotation = isFlipped ? 180 : 0;
    const rotation = Math.max(-180, Math.min(180, (deltaX / maxDistance) * 180));
    const newRotation = baseRotation + rotation;
    
    // Clamp rotation between 0 and 180
    const clampedRotation = Math.max(0, Math.min(180, newRotation));
    
    // Calculate parallax depth - move forward as it rotates
    // At 90deg (halfway), card should be furthest forward
    const progress = clampedRotation / 180;
    const parallaxDepth = Math.sin(progress * Math.PI) * 50; // Max 50px forward
    
    // Use requestAnimationFrame for smooth animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
      animationFrameRef.current = requestAnimationFrame(() => {
        if (frontRef.current && backRef.current && cardRef.current) {
          frontRef.current.style.transition = 'none';
          backRef.current.style.transition = 'none';
          cardRef.current.style.transition = 'none';
          
          // Apply parallax to card container
          cardRef.current.style.transform = `${getBaseTransform()} translateZ(${parallaxDepth}px)`;
          
          // Rotate front and back with depth
          frontRef.current.style.transform = `rotateY(${clampedRotation}deg) translateZ(0)`;
          backRef.current.style.transform = `rotateY(${clampedRotation + 180}deg) translateZ(0)`;
        }
      });
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const distance = Math.abs(deltaX);
    const timeDelta = Date.now() - touchStartRef.current.time;
    const velocity = distance / timeDelta;
    
    finishSwipe(deltaX, distance, velocity);
  };

  const finishSwipe = (deltaX, distance, velocity) => {
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Determine if we should flip based on distance and velocity
    const shouldFlip = 
      (distance > 80) || // Swiped far enough
      (distance > 40 && velocity > 0.3); // Quick swipe
    
    // Determine flip direction
    const shouldFlipToBack = deltaX > 0 && !isFlipped;
    const shouldFlipToFront = deltaX < 0 && isFlipped;
    
    if (shouldFlip && (shouldFlipToBack || shouldFlipToFront)) {
      // Complete the flip with parallax
      if (frontRef.current && backRef.current && cardRef.current) {
        frontRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        backRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        cardRef.current.style.transition = 'transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        // Reset parallax after flip completes
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.transform = getBaseTransform();
          }
        }, 800);
      }
      // Use setTimeout to avoid state update during render
      setTimeout(() => {
        setIsFlipped((prev) => !prev);
      }, 0);
    } else {
      // Snap back to current state
      if (frontRef.current && backRef.current && cardRef.current) {
        frontRef.current.style.transition = 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
        backRef.current.style.transition = 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
        cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
        
        const targetRotation = isFlipped ? 180 : 0;
        frontRef.current.style.transform = `rotateY(${targetRotation}deg) translateZ(0)`;
        backRef.current.style.transform = `rotateY(${targetRotation + 180}deg) translateZ(0)`;
        cardRef.current.style.transform = getBaseTransform();
      }
    }
    
    touchStartRef.current = null;
    isSwipingRef.current = false;
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e) => {
    // Don't start drag if clicking interactive elements
    const target = e.target;
    if (target.closest('button') || target.closest('a') || target.closest('.social-icon') || target.closest('.indicator')) {
      return;
    }
    
    if (e.button !== 0) return; // Only left mouse button
    
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
    isSwipingRef.current = false;
    
    const handleMouseMove = (e) => {
      if (!touchStartRef.current) return;
      
      const deltaX = e.clientX - touchStartRef.current.x;
      const distance = Math.abs(deltaX);
      
      if (distance > 10) {
        isSwipingRef.current = true;
      }
      
      if (!isSwipingRef.current || !frontRef.current || !backRef.current || !cardRef.current) return;

      const maxDistance = 150;
      const baseRotation = isFlipped ? 180 : 0;
      const rotation = Math.max(-180, Math.min(180, (deltaX / maxDistance) * 180));
      const newRotation = baseRotation + rotation;
      const clampedRotation = Math.max(0, Math.min(180, newRotation));
      
      // Calculate parallax depth
      const progress = clampedRotation / 180;
      const parallaxDepth = Math.sin(progress * Math.PI) * 50;
      
      // Use requestAnimationFrame for smooth animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      animationFrameRef.current = requestAnimationFrame(() => {
        if (frontRef.current && backRef.current && cardRef.current) {
          frontRef.current.style.transition = 'none';
          backRef.current.style.transition = 'none';
          cardRef.current.style.transition = 'none';
          
          // Apply parallax to card container
          cardRef.current.style.transform = `${getBaseTransform()} translateZ(${parallaxDepth}px)`;
          
          frontRef.current.style.transform = `rotateY(${clampedRotation}deg) translateZ(0)`;
          backRef.current.style.transform = `rotateY(${clampedRotation + 180}deg) translateZ(0)`;
        }
      });
    };

    const handleMouseUp = (e) => {
      if (!touchStartRef.current) return;
      
      const deltaX = e.clientX - touchStartRef.current.x;
      const distance = Math.abs(deltaX);
      const timeDelta = Date.now() - touchStartRef.current.time;
      const velocity = distance / Math.max(timeDelta, 1);
      
      finishSwipe(deltaX, distance, velocity);
      
      // Clean up event listeners
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener('mousemove', mouseMoveHandlerRef.current);
        mouseMoveHandlerRef.current = null;
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener('mouseup', mouseUpHandlerRef.current);
        mouseUpHandlerRef.current = null;
      }
    };

    // Store handlers for cleanup
    mouseMoveHandlerRef.current = handleMouseMove;
    mouseUpHandlerRef.current = handleMouseUp;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 3D Parallax tilt effect (both vertical & horizontal)
  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    // Desktop: mouse-based parallax
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      const maxTilt = isActive ? 18 : 10;
      const tiltX = (y / (rect.height / 2)) * maxTilt;
      const tiltY = (x / (rect.width / 2)) * -maxTilt;
      setTilt({ x: tiltX, y: tiltY });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    // Mobile: device orientation–based parallax
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const handleOrientation = (event) => {
      if (!isTouchDevice || !cardRef.current) return;
      const { beta, gamma } = event; // beta: front/back tilt, gamma: left/right
      if (beta == null || gamma == null) return;

      const maxTilt = isActive ? 18 : 10;
      const normalizedX = Math.max(-30, Math.min(30, beta));  // up/down
      const normalizedY = Math.max(-30, Math.min(30, gamma)); // left/right

      const tiltX = (normalizedX / 30) * maxTilt;
      const tiltY = -(normalizedY / 30) * maxTilt;

      setTilt({ x: tiltX, y: tiltY });
    };

    if (isTouchDevice && typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (isTouchDevice && typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing animations
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Remove mouse event listeners
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener('mousemove', mouseMoveHandlerRef.current);
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener('mouseup', mouseUpHandlerRef.current);
      }
    };
  }, []);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = cardData.slides[currentSlide];

  const getIconComponent = (iconName) => {
    const iconMap = {
      'fa-phone-alt': FaPhoneAlt,
      'fa-mobile-alt': FaMobileAlt,
      'fa-envelope': FaEnvelope,
      'fa-map-marker-alt': FaMapMarkerAlt,
      'fa-hashtag': FaHashtag,
      'fa-user-friends': FaUserFriends,
      'fa-users': FaUsers,
      'fa-video': FaVideo,
      'fa-globe': FaGlobe,
    };
    const IconComponent = iconMap[iconName] || FaPhoneAlt;
    return <IconComponent />;
  };

  const getSocialIcon = (platform) => {
    const iconMap = {
      facebook: FaFacebookF,
      instagram: FaInstagram,
      twitter: FaTwitter,
      linkedin: FaLinkedinIn,
      whatsapp: FaWhatsapp,
      github: FaGithub,
      calendar: FaCalendarAlt,
      phone: FaPhone,
      sms: FaSms,
      email: FaEnvelope,
    };
    const IconComponent = iconMap[platform] || FaPhone;
    return <IconComponent />;
  };

  // Since we only have one card, simplify the calculations
  const translateY = 0;
  const scale = 1;
  const zIndex = 10;
  const opacity = 1;
  
  // Apply 3D tilt effect - more subtle for inactive cards
  const tiltIntensity = isActive ? 1 : 0.5;
  const depth = isActive ? 40 : 25;
  // Parallax translation based on tilt in both axes
  const parallaxTranslateX = tilt.y * -0.4;
  const parallaxTranslateY = tilt.x * 0.4;
  const tiltTransform = !isFlipped 
    ? `rotateX(${tilt.x * tiltIntensity}deg) rotateY(${tilt.y * tiltIntensity}deg)` 
    : '';

  return (
    <div
      ref={cardRef}
      className={`contact-card ${cardData.className} ${isFlipped ? 'flipped' : ''} ${isActive ? 'active' : ''}`}
      id={cardData.id}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ 
        touchAction: 'pan-y', 
        userSelect: 'none',
        transform: `translate3d(${parallaxTranslateX}px, ${translateY + parallaxTranslateY}px, ${depth}px) scale(${scale}) ${tiltTransform}`,
        zIndex: zIndex,
        opacity: Math.max(0.6, opacity),
        pointerEvents: 'auto'
      }}
    >
      {/* Front of Card */}
      <div ref={frontRef} className="card-front">
        <div className="card-header">
          <Image
            src={cardData.profileImage}
            alt="Profile"
            className="profile-img"
            width={90}
            height={90}
            priority
          />
          <div className="name-title">
            <h2>{cardData.name}</h2>
            <p>{cardData.subtitle}</p>
          </div>
        </div>

        <div className="card-icon">
          {getIconComponent(currentSlideData.icon)}
        </div>

        <h3 className="card-title">{currentSlideData.title}</h3>

        <div
          className="contact-info"
          dangerouslySetInnerHTML={{ __html: currentSlideData.content }}
        />

        <div className="social-icons">
          {currentSlideData.socialLinks?.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className="social-icon"
              title={link.title}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              download={link.url?.toLowerCase().endsWith('.vcf') ? 'Frank-Posada-IV.vcf' : undefined}
              onClick={(e) => {
                // Make sure card swipe/flip handlers never require a second tap
                e.stopPropagation();
              }}
              onTouchStart={(e) => {
                // Prevent the parent touch handlers from "eating" the first tap on mobile
                e.stopPropagation();
              }}
            >
              {getSocialIcon(link.platform)}
            </a>
          ))}
        </div>

        {cardData.slides.length > 1 && (
          <div className="slide-indicator">
            {cardData.slides.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleSlideChange(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSlideChange(index);
                  }
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Back of Card */}
      <div ref={backRef} className="card-back">
        <div className="card-icon">
          {getIconComponent(cardData.backIcon)}
        </div>

        <h3 className="card-title">{cardData.backTitle}</h3>

        <div
          className="contact-info"
          dangerouslySetInnerHTML={{ __html: cardData.backContent }}
        />
      </div>
    </div>
  );
};

export default ContactCard;
