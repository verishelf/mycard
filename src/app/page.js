'use client';

import { useState, useEffect, useRef } from 'react';
import ContactCard from '@/components/ContactCard';
import Notification from '@/components/Notification';
import { FaPhoneAlt, FaHashtag, FaEnvelope, FaSyncAlt, FaArrowLeft } from 'react-icons/fa';

const allCardData = [
  {
    id: 'card1',
    className: 'card-1',
    name: 'Frank Posada IV',
    subtitle: 'Phone & Contact',
    profileImage: '/paco.jpg',
    slides: [
      {
        icon: 'fa-phone-alt',
        title: 'Phone & WhatsApp',
        content: '<p>(619) 901-7344</p><p class="mt-3 text-sm opacity-80">Available Mon-Fri, 9AM-6PM PST</p>',
        socialLinks: [
          { platform: 'phone', url: 'tel:+16199017344', title: 'Call' },
          { platform: 'whatsapp', url: 'https://wa.me/16199017344', title: 'WhatsApp', external: true },
          { platform: 'sms', url: 'sms:+16199017344', title: 'Text' },
        ],
      },
    ],
    backIcon: 'fa-mobile-alt',
    backTitle: 'Contact Information',
    backContent: '<p class="mb-3"><strong>Phone:</strong> (619) 901-7344</p><p class="mb-3"><strong>Text:</strong> (619) 901-7344</p><p class="text-sm opacity-80 mt-4">For urgent matters, please call directly</p>',
  },
  {
    id: 'card2',
    className: 'card-2',
    name: 'Frank Posada IV',
    subtitle: 'Social Media',
    profileImage: '/paco.jpg',
    slides: [
      {
        icon: 'fa-hashtag',
        title: 'Social Media',
        content: '<p>Connect with me on social platforms</p><p class="mt-2">Follow for updates and insights</p>',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com', title: 'Facebook', external: true },
          { platform: 'instagram', url: 'https://instagram.com', title: 'Instagram', external: true },
          { platform: 'twitter', url: 'https://twitter.com', title: 'Twitter', external: true },
          { platform: 'linkedin', url: 'https://linkedin.com', title: 'LinkedIn', external: true },
        ],
      },
    ],
    backIcon: 'fa-user-friends',
    backTitle: 'Social Details',
    backContent: '<p class="mb-2"><strong>Connect on social media</strong></p><p class="mt-4 text-sm opacity-80">Stay updated with my latest work</p>',
  },
  {
    id: 'card3',
    className: 'card-3',
    name: 'Frank Posada IV',
    subtitle: 'Email & Location',
    profileImage: '/paco.jpg',
    slides: [
      {
        icon: 'fa-envelope',
        title: 'Email & Location',
        content: '<p>Contact me via email</p><p class="mt-3">Based in San Diego, CA</p><p class="text-sm opacity-80 mt-3">Available for remote work</p>',
        socialLinks: [
          { platform: 'email', url: 'mailto:frank@example.com', title: 'Email' },
          { platform: 'github', url: 'https://github.com', title: 'GitHub', external: true },
          { platform: 'calendar', url: 'https://calendly.com', title: 'Schedule', external: true },
        ],
      },
    ],
    backIcon: 'fa-map-marker-alt',
    backTitle: 'Location & Other',
    backContent: '<p class="mb-2"><strong>Location:</strong> San Diego, CA</p><p class="mb-2"><strong>Phone:</strong> (619) 901-7344</p><p class="mt-4 text-sm opacity-80">Let\'s connect!</p>',
  },
];

const tabs = [
  { id: 'phone', label: 'Phone', icon: FaPhoneAlt },
  { id: 'social', label: 'Social', icon: FaHashtag },
  { id: 'email', label: 'Email', icon: FaEnvelope },
];

export default function Home() {
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [activeTab, setActiveTab] = useState('phone');
  const containerRef = useRef(null);
  const flipButtonRef = useRef(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const showNotification = (message) => {
    setNotification({ show: true, message });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '' });
  };

  // Get the active card based on tab
  const getActiveCard = () => {
    const tabIndexMap = { phone: 0, social: 1, email: 2 };
    return allCardData[tabIndexMap[activeTab]] || allCardData[0];
  };

  // Copy to clipboard functionality
  useEffect(() => {
    const handleCopy = async (e) => {
      const target = e.target;
      const socialIcon = target.closest('.social-icon');
      
      if (socialIcon) {
        const href = socialIcon.getAttribute('href');
        if (href?.startsWith('tel:')) {
          const phoneNumber = href.replace('tel:', '');
          try {
            await navigator.clipboard.writeText(phoneNumber);
            showNotification(`Copied to clipboard: ${phoneNumber}`);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        } else if (href?.startsWith('mailto:')) {
          const email = href.replace('mailto:', '');
          try {
            await navigator.clipboard.writeText(email);
            showNotification(`Copied to clipboard: ${email}`);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        }
      }
    };

    document.addEventListener('click', handleCopy);
    return () => document.removeEventListener('click', handleCopy);
  }, []);

  const activeCard = getActiveCard();

  return (
    <>
      <div className="parallax-bg" />
      <div className="card-container" ref={containerRef}>
        <div className="tabs-container">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div key={activeTab} className="card-wrapper">
          <ContactCard 
            cardData={activeCard} 
            index={0}
            isActive={true}
            totalCards={1}
            activeCardIndex={0}
            onFlipRef={flipButtonRef}
            onFlipStateChange={setIsCardFlipped}
          />
          <button 
            className="flip-button-external" 
            onClick={() => {
              if (flipButtonRef.current) {
                flipButtonRef.current();
              }
            }} 
            aria-label={isCardFlipped ? "Flip back" : "Flip card"}
          >
            {isCardFlipped ? (
              <FaArrowLeft className="flip-icon" />
            ) : (
              <FaSyncAlt className="flip-icon" />
            )}
          </button>
        </div>
      </div>
      <Notification
        message={notification.message}
        show={notification.show}
        onClose={hideNotification}
      />
    </>
  );
}
