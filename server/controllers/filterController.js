const Filter = require('../models/Filter');

exports.getFilters = async (req, res) => {
  try {
    const filters = await Filter.find();
    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFilter = async (req, res) => {
  try {
    const filter = new Filter(req.body);
    await filter.save();
    res.status(201).json(filter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFilter = async (req, res) => {
  try {
    await Filter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Filter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
