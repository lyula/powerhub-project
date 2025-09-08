const Collaboration = require('../models/Collaboration');
const User = require('../models/User');

// Create a new collaboration project
exports.createCollaboration = async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      overview,
      deploymentLink,
      tasksForCollaborators,
      additionalInfo,
      contactMethods
    } = req.body;

    const userId = req.user._id;

    // Validate that user has the contact methods they're offering
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if selected contact methods are available in user profile
    const invalidMethods = [];
    Object.entries(contactMethods).forEach(([method, selected]) => {
      if (selected && !user[method]) {
        invalidMethods.push(method);
      }
    });

    if (invalidMethods.length > 0) {
      return res.status(400).json({ 
        error: `Please add ${invalidMethods.join(', ')} to your profile before selecting them as contact methods` 
      });
    }

    // Ensure at least one contact method is selected
    const hasSelectedMethod = Object.values(contactMethods).some(selected => selected);
    if (!hasSelectedMethod) {
      return res.status(400).json({ error: 'Please select at least one contact method' });
    }

    const collaboration = new Collaboration({
      title,
      category,
      description,
      overview,
      deploymentLink,
      tasksForCollaborators,
      additionalInfo,
      contactMethods,
      author: userId
    });

    await collaboration.save();

    // Populate author info for response
    await collaboration.populate('author', 'firstName lastName username profilePicture github whatsapp linkedin instagram');

    res.status(201).json({
      message: 'Collaboration project created successfully',
      collaboration
    });

  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(500).json({ error: 'Failed to create collaboration project' });
  }
};

// Get all collaboration projects
exports.getCollaborations = async (req, res) => {
  try {
    const { category, status = 'active', page = 1, limit = 10 } = req.query;
    
    const filter = { status };
    if (category) {
      filter.category = category;
    }

    const collaborations = await Collaboration.find(filter)
      .populate('author', 'firstName lastName username profilePicture github whatsapp linkedin instagram')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Collaboration.countDocuments(filter);

    res.json({
      collaborations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({ error: 'Failed to fetch collaborations' });
  }
};

// Get a specific collaboration project
exports.getCollaboration = async (req, res) => {
  try {
    const { id } = req.params;

    const collaboration = await Collaboration.findById(id)
      .populate('author', 'firstName lastName username profilePicture github whatsapp linkedin instagram')
      .populate('collaborators.user', 'firstName lastName username profilePicture')
      .populate('interested.user', 'firstName lastName username profilePicture');

    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    // Increment view count (but not for the author)
    if (req.user && req.user._id.toString() !== collaboration.author._id.toString()) {
      collaboration.views += 1;
      await collaboration.save();
    }

    res.json(collaboration);

  } catch (error) {
    console.error('Error fetching collaboration:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration project' });
  }
};

// Update collaboration project (only by author)
exports.updateCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const collaboration = await Collaboration.findById(id);
    
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    if (collaboration.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the project author can update this collaboration' });
    }

    const updatedCollaboration = await Collaboration.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username profilePicture github whatsapp linkedin instagram');

    res.json({
      message: 'Collaboration project updated successfully',
      collaboration: updatedCollaboration
    });

  } catch (error) {
    console.error('Error updating collaboration:', error);
    res.status(500).json({ error: 'Failed to update collaboration project' });
  }
};

// Delete collaboration project (only by author)
exports.deleteCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const collaboration = await Collaboration.findById(id);
    
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    if (collaboration.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the project author can delete this collaboration' });
    }

    await Collaboration.findByIdAndDelete(id);

    res.json({ message: 'Collaboration project deleted successfully' });

  } catch (error) {
    console.error('Error deleting collaboration:', error);
    res.status(500).json({ error: 'Failed to delete collaboration project' });
  }
};

// Express interest in a collaboration project
exports.expressInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const collaboration = await Collaboration.findById(id);
    
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    if (collaboration.author.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You cannot express interest in your own project' });
    }

    // Check if user already expressed interest
    const alreadyInterested = collaboration.interested.some(
      item => item.user.toString() === userId.toString()
    );

    if (alreadyInterested) {
      return res.status(400).json({ error: 'You have already expressed interest in this project' });
    }

    collaboration.interested.push({
      user: userId,
      message: message || ''
    });

    await collaboration.save();

    res.json({ message: 'Interest expressed successfully' });

  } catch (error) {
    console.error('Error expressing interest:', error);
    res.status(500).json({ error: 'Failed to express interest' });
  }
};

// Get user's own collaboration projects
exports.getMyCollaborations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const collaborations = await Collaboration.find({ author: userId })
      .populate('collaborators.user', 'firstName lastName username profilePicture')
      .populate('interested.user', 'firstName lastName username profilePicture')
      .sort({ createdAt: -1 });

    res.json(collaborations);

  } catch (error) {
    console.error('Error fetching user collaborations:', error);
    res.status(500).json({ error: 'Failed to fetch your collaborations' });
  }
};

// Track project view/click
exports.trackProjectView = async (req, res) => {
  try {
    const { id } = req.params;
    
    const collaboration = await Collaboration.findById(id);
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration project not found' });
    }

    // Increment view count
    collaboration.views = (collaboration.views || 0) + 1;
    await collaboration.save();

    res.json({ message: 'View tracked successfully' });

  } catch (error) {
    console.error('Error tracking project view:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
};

// Get category counts for active projects
exports.getCategoryCounts = async (req, res) => {
  try {
    const counts = await Collaboration.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    // Convert array to object for easier frontend access
    const countsObject = {};
    counts.forEach(item => {
      countsObject[item.category] = item.count;
    });

    res.json(countsObject);

  } catch (error) {
    console.error('Error fetching category counts:', error);
    res.status(500).json({ error: 'Failed to fetch category counts' });
  }
};
