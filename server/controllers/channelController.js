// Get channel by owner user ID
exports.getChannelByOwner = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const channel = await Channel.findOne({ owner: ownerId });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    // Fetch contact details from User model
    const User = require('../models/User');
    const user = await User.findById(ownerId).lean();
    // Optionally fetch videos for this channel
    const Video = require('../models/Video');
    const videos = await Video.find({ channel: channel._id }).sort({ createdAt: -1 });
    // Prepare contact info
    const contactInfo = Object.fromEntries(
      Object.entries({
        email: user?.email,
        github: user?.github,
        whatsapp: user?.whatsapp,
        linkedin: user?.linkedin,
        instagram: user?.instagram
      }).filter(([_, value]) => value) // Filter out empty or null values
    );
    res.json({ ...channel.toObject(), videos, contactInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Subscribe to a channel
exports.subscribeChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    if (!channel.subscribers.some(sub => sub.user && sub.user.toString() === userId.toString())) {
      channel.subscribers.push({ user: userId });
      // Remove any invalid subscriber objects
      channel.subscribers = channel.subscribers.filter(sub => sub.user);
      await channel.save();

      // Send notification to channel owner if not subscribing to own channel
      if (channel.owner.toString() !== userId.toString()) {
        const NotificationService = require('../services/notificationService');
        await NotificationService.sendSubscribeNotification(
          channel.owner,
          userId,
          channel.name
        );
      }
    }
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Unsubscribe from a channel
exports.unsubscribeChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    channel.subscribers = channel.subscribers.filter(
      (sub) => sub.user.toString() !== userId.toString()
    );
    await channel.save();
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Channel = require('../models/Channel');
const cloudinary = require('../config/cloudinary');

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    console.log('Channel creation request received');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('Request files:', req.files);

    const { name, description } = req.body;
    const owner = req.user._id;

    // Check if user already has a channel
    const existing = await Channel.findOne({ owner });
    if (existing) {
      console.log('User already has a channel:', existing);
      return res.status(400).json({ error: 'User already has a channel.' });
    }

    let avatarUrl = '';
    let bannerUrl = '';

    const fs = require('fs');
    // Handle avatar upload
      // If avatar URL is provided in body, use it directly
      if (req.body.avatar) {
        avatarUrl = req.body.avatar;
      } else if (req.files && req.files.avatar) {
        try {
          const avatarPath = req.files.avatar[0].path;
          console.log('Uploading avatar:', avatarPath);
          const avatarUpload = await cloudinary.uploader.upload(avatarPath, {
            folder: 'powerhub/channels/avatars',
            resource_type: 'image',
          });
          avatarUrl = avatarUpload.secure_url;
          console.log('Avatar uploaded:', avatarUrl);
          // Delete temp file
          fs.unlink(avatarPath, (err) => {
            if (err) console.error('Failed to delete temp avatar:', err);
          });
        } catch (avatarErr) {
          console.error('Avatar upload error:', avatarErr);
          return res.status(500).json({ error: 'Avatar upload failed', details: avatarErr });
        }
      }

    // Handle banner upload
      if (req.body.banner) {
        bannerUrl = req.body.banner;
      } else if (req.files && req.files.banner) {
        try {
          const bannerPath = req.files.banner[0].path;
          console.log('Uploading banner:', bannerPath);
          const bannerUpload = await cloudinary.uploader.upload(bannerPath, {
            folder: 'powerhub/channels/banners',
            resource_type: 'image',
          });
          bannerUrl = bannerUpload.secure_url;
          console.log('Banner uploaded:', bannerUrl);
          // Delete temp file
          fs.unlink(bannerPath, (err) => {
            if (err) console.error('Failed to delete temp banner:', err);
        });
      } catch (bannerErr) {
        console.error('Banner upload error:', bannerErr);
        return res.status(500).json({ error: 'Banner upload failed', details: bannerErr });
      }
    }

    try {
      const channel = new Channel({
        name,
        description,
        owner,
        avatar: avatarUrl,
        banner: bannerUrl
      });
      await channel.save();
      console.log('Channel saved:', channel);
      res.status(201).json(channel);
    } catch (dbErr) {
      console.error('Channel DB save error:', dbErr);
      res.status(500).json({ error: 'Channel DB save failed', details: dbErr });
    }
  } catch (err) {
    console.error('Channel creation error:', err);
    res.status(500).json({ error: err.message, details: err });
  }
};

// Get current user's channel
exports.getMyChannel = async (req, res) => {
  try {
    const owner = req.user._id;
    const channel = await Channel.findOne({ owner });
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get channel by id
exports.getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    // Fetch videos for this channel
    const Video = require('../models/Video');
    const videos = await Video.find({ channel: channel._id }).sort({ createdAt: -1 });
    // Fetch contact details from User model
    const User = require('../models/User');
    const user = await User.findById(channel.owner).lean();
    const contactInfo = Object.fromEntries(
      Object.entries({
        email: user?.email,
        github: user?.github,
        whatsapp: user?.whatsapp,
        linkedin: user?.linkedin,
        instagram: user?.instagram
      }).filter(([_, value]) => value) // Filter out empty or null values
    );
    res.json({ ...channel.toObject(), videos, contactInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update channel profile
exports.updateChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    if (channel.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { name, description } = req.body;
    if (name) channel.name = name;
    if (description) channel.description = description;
    // Handle avatar upload
    if (req.body.avatar) {
      channel.avatar = req.body.avatar;
    } else if (req.files && req.files.avatar) {
      const avatarPath = req.files.avatar[0].path;
      const avatarUpload = await cloudinary.uploader.upload(avatarPath, {
        folder: 'powerhub/channels/avatars',
        resource_type: 'image',
      });
      channel.avatar = avatarUpload.secure_url;
      require('fs').unlink(avatarPath, () => {});
    }
    // Handle banner upload
    if (req.body.banner) {
      channel.banner = req.body.banner;
    } else if (req.files && req.files.banner) {
      const bannerPath = req.files.banner[0].path;
      const bannerUpload = await cloudinary.uploader.upload(bannerPath, {
        folder: 'powerhub/channels/banners',
        resource_type: 'image',
      });
      channel.banner = bannerUpload.secure_url;
      require('fs').unlink(bannerPath, () => {});
    }
    await channel.save();
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete channel and all content
exports.deleteChannel = async (req, res) => {
  try {
    const channelId = req.params.id;
    const userId = req.user._id;
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }
    if (channel.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    // Delete all videos for this channel
    const Video = require('../models/Video');
    await Video.deleteMany({ channel: channel._id });
    // TODO: Delete other related content if needed (posts, notifications, etc)
    await channel.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for channels by name similarity
const stringSimilarity = require('string-similarity');

exports.searchChannels = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }
    const channels = await Channel.find(
      { name: { $regex: query, $options: 'i' } }, // Match name field with case-insensitive regex
      'name subscribers avatar author'
    );
    // console.log('Channels fetched:', channels);
    const matchingChannels = channels
      .map(channel => {
        const similarity = stringSimilarity.compareTwoStrings(query.toLowerCase(), channel.name.toLowerCase());
        return { 
          ...channel.toObject(), 
          similarity,
          subscriberCount: Array.isArray(channel.subscribers) ? channel.subscribers.length : channel.subscribers || 0
        };
      })
      .filter(channel => channel.similarity >= 0.30) // 30% similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Limit to top 3 results

    res.json(matchingChannels);
  } catch (err) {
    console.error('Error in searchChannels:', err);
    res.status(500).json({ error: err.message });
  }
};
