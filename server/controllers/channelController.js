const Channel = require('../models/Channel');

// Create a new channel
exports.createChannel = async (req, res) => {
  try {
    const { name, description, avatar, banner } = req.body;
    const owner = req.user._id; // Assumes user is authenticated and req.user is set

    // Check if user already has a channel
    const existing = await Channel.findOne({ owner });
    if (existing) {
      return res.status(400).json({ error: 'User already has a channel.' });
    }

    const channel = new Channel({
      name,
      description,
      owner,
      avatar,
      banner
    });
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
