import React from 'react';
import { FaYoutube, FaTwitter, FaInstagram, FaFacebook, FaTiktok, FaLinkedin, FaWhatsapp, FaGithub, FaEnvelope } from 'react-icons/fa';


export default function ProfilePictureZoomModal({ open, onClose, profilePicture, channelName, socialLinks, onViewChannel }) {
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
  <div className="absolute bottom-0 left-0 w-full flex flex-row justify-between items-end px-4 py-3" style={{background: 'rgba(0,0,0,0.95)'}}>
          <div
            className="text-white font-semibold text-base px-0 py-0 w-fit cursor-pointer hover:underline transition"
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={onViewChannel}
          >
            View channel
          </div>
          <div className="flex gap-3 items-center">
            {/* Always show these icons, use socialLinks if available, else '#' */}
            <a href={socialLinks?.linkedin || '#'} target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin className="text-blue-700 text-2xl" /></a>
            <a href={socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram className="text-pink-500 text-2xl" /></a>
            <a href={socialLinks?.whatsapp || '#'} target="_blank" rel="noopener noreferrer" title="WhatsApp"><FaWhatsapp className="text-green-500 text-2xl" /></a>
            <a href={socialLinks?.github || '#'} target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub className="text-gray-200 text-2xl" /></a>
            <a href={socialLinks?.email ? `mailto:${socialLinks.email}` : '#'} target="_blank" rel="noopener noreferrer" title="Email"><FaEnvelope className="text-yellow-400 text-2xl" /></a>
            {/* Optionally show other icons if present */}
            {socialLinks?.youtube && <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube className="text-red-600 text-2xl" /></a>}
            {socialLinks?.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter"><FaTwitter className="text-blue-400 text-2xl" /></a>}
            {socialLinks?.facebook && <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" title="Facebook"><FaFacebook className="text-blue-700 text-2xl" /></a>}
            {socialLinks?.tiktok && <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok className="text-black text-2xl" /></a>}
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
