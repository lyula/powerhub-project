import React from 'react';
import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaLinkedin, FaWhatsapp, FaGithub, FaEnvelope } from 'react-icons/fa';


export default function ProfilePictureZoomModal({ open, onClose, profilePicture, channelName, socialLinks, hasChannel, onViewChannel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={onClose}>
      <div className="relative bg-transparent flex flex-col items-center" style={{ minWidth: 320, minHeight: 320 }} onClick={e => e.stopPropagation()}>
        <img
          src={profilePicture}
          alt={channelName}
          className="object-cover w-80 h-80 shadow-2xl"
          style={{ aspectRatio: '1/1', background: '#222' }}
        />
        <div
          className={`absolute bottom-0 left-0 w-full flex flex-row px-4 py-3 items-end ${hasChannel ? 'justify-between' : 'justify-center'}`}
          style={{background: 'rgba(0,0,0,0.95)'}}
        >
          {hasChannel && (
            <div
              className="text-white font-semibold text-base px-0 py-0 w-fit cursor-pointer hover:underline transition"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={onViewChannel}
            >
              View channel
            </div>
          )}
          <div className="flex gap-3 items-center">
            {/* Only render icons for contact info that exists. If none, show only email. */}
            {(() => {
              const icons = [];
              // Always show email icon if present
              if (socialLinks?.email) {
                icons.push(<a href={`mailto:${socialLinks.email}`} target="_blank" rel="noopener noreferrer" title={socialLinks.email} key="email"><FaEnvelope className="text-yellow-400 text-2xl" /></a>);
              }
              // Show other icons only if present
              if (socialLinks?.linkedin) icons.push(<a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" key="linkedin"><FaLinkedin className="text-blue-700 text-2xl" /></a>);
              if (socialLinks?.instagram) icons.push(<a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" key="instagram"><FaInstagram className="text-pink-500 text-2xl" /></a>);
              if (socialLinks?.whatsapp) icons.push(<a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" title="WhatsApp" key="whatsapp"><FaWhatsapp className="text-green-500 text-2xl" /></a>);
              if (socialLinks?.github) icons.push(<a href={socialLinks.github} target="_blank" rel="noopener noreferrer" title="GitHub" key="github"><FaGithub className="text-gray-200 text-2xl" /></a>);
              if (socialLinks?.youtube) icons.push(<a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" key="youtube"><FaYoutube className="text-red-600 text-2xl" /></a>);
              if (socialLinks?.twitter) icons.push(<a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" key="twitter"><FaTwitter className="text-blue-400 text-2xl" /></a>);
              if (socialLinks?.facebook) icons.push(<a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" key="facebook"><FaFacebook className="text-blue-700 text-2xl" /></a>);
              if (socialLinks?.tiktok) icons.push(<a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" key="tiktok"><FaTiktok className="text-black text-2xl" /></a>);
              // If no email, show disabled email icon
              if (!socialLinks?.email && icons.length === 0) {
                icons.push(<span title="No email available" key="email"><FaEnvelope className="text-gray-500 text-2xl opacity-50" /></span>);
              }
              return icons;
            })()}
          </div>
        </div>
        <button
          className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition"
          onClick={onClose}
        >
          <span className="text-lg">&times;</span>
        </button>
      </div>
    </div>
  );
}
