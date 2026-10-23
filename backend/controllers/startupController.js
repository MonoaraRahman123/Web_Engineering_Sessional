const Startup = require('../models/Startup');

// In-memory fallback dataset in case MongoDB is temporarily unavailable
let memoryStartups = [
  {
    _id: '1',
    name: '10 Minute School',
    sector: 'K-12',
    founders: 'Ayman Sadiq',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2015,
    totalFunding: 7500000, // $7.5M
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
    website: 'https://10minuteschool.com',
    description: 'Largest online learning platform in Bangladesh offering free & paid courses for K-12, university admission, and skill development.'
  },
  {
    _id: '2',
    name: 'Shikho',
    sector: 'K-12',
    founders: 'Shahir Chowdhury, Zeeshan Zakaria',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2019,
    totalFunding: 5600000, // $5.6M
    logoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80',
    website: 'https://shikho.com',
    description: 'Hyper-localized EdTech platform modernizing education with animated video lessons, live classes, and question banks.'
  },
  {
    _id: '3',
    name: 'Interactive Cares',
    sector: 'Upskilling',
    founders: 'Al-Amin Kabir, Jamila Binte Khurshid',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2020,
    totalFunding: 1200000, // $1.2M
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
    website: 'https://interactivecares.com',
    description: 'Virtual platform offering real-time mentorship, courses, and job placements in software engineering and cloud technologies.'
  },
  {
    _id: '4',
    name: 'Bohubrihi',
    sector: 'Upskilling',
    founders: 'Yanur Islam Piash',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2016,
    totalFunding: 600000, // $600K
    logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80',
    website: 'https://bohubrihi.com',
    description: 'Premium e-learning platform providing industry-relevant professional track courses (Acquired by Shikho).'
  },
  {
    _id: '5',
    name: 'Ostad',
    sector: 'Coding',
    founders: 'Sourabh Jyoti, Md. Sorowar Hossain',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2020,
    totalFunding: 500000, // $500K
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80',
    website: 'https://ostad.app',
    description: 'Live interactive skill development platform focusing on coding, UI/UX, data science, and product design.'
  },
  {
    _id: '6',
    name: 'Upskill',
    sector: 'Upskilling',
    founders: 'Mustafizur Rahman Khan',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2018,
    totalFunding: 250000, // $250K
    logoUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
    website: 'https://upskill.com.bd',
    description: 'Peer-to-peer video platform empowering professionals to upgrade skills through workshops and micro-courses.'
  },
  {
    _id: '7',
    name: 'EduHive',
    sector: 'Test Prep',
    founders: 'Nazmul Haque, Nazmus Saqib',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2019,
    totalFunding: 200000, // $200K
    logoUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80',
    website: 'https://eduhive.com.bd',
    description: 'Leading online test preparation and assessment platform connecting nationwide students with prominent educators.'
  },
  {
    _id: '8',
    name: 'Programming Hero',
    sector: 'Coding',
    founders: 'Jhankar Mahbub',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: 2019,
    totalFunding: 150000, // $150K
    logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    website: 'https://programming-hero.com',
    description: 'Gamified programming education platform teaching web and mobile development to thousands of youth.'
  }
];

// Helper to check if mongoose is connected
const isMongooseConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// @desc    Get all startups (with filtering, search, sorting & optional pagination)
// @route   GET /api/startups
// @access  Public
exports.getStartups = async (req, res) => {
  try {
    const { search = '', sector = '', sortBy = 'totalFunding', sortOrder = 'desc', page, limit } = req.query;

    if (isMongooseConnected()) {
      const query = {};

      // Search across name or sector
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sector: { $regex: search, $options: 'i' } },
          { founders: { $regex: search, $options: 'i' } }
        ];
      }

      // Sector specific filter
      if (sector && sector !== 'All') {
        query.sector = sector;
      }

      // Sorting
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 0; // 0 returns all
      const skip = (pageNum - 1) * limitNum;

      const totalCount = await Startup.countDocuments(query);
      let queryChain = Startup.find(query).sort(sort);

      if (limitNum > 0) {
        queryChain = queryChain.skip(skip).limit(limitNum);
      }

      const startups = await queryChain;

      return res.status(200).json({
        success: true,
        count: startups.length,
        totalCount,
        page: limitNum > 0 ? pageNum : 1,
        totalPages: limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
        startups,
      });
    }

    // Fallback in-memory processing
    let result = [...memoryStartups];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(s) ||
          item.sector.toLowerCase().includes(s) ||
          item.founders.toLowerCase().includes(s)
      );
    }

    if (sector && sector !== 'All') {
      result = result.filter(item => item.sector.toLowerCase() === sector.toLowerCase());
    }

    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (typeof valA === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    const totalCount = result.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 0;

    let paginated = result;
    if (limitNum > 0) {
      const start = (pageNum - 1) * limitNum;
      paginated = result.slice(start, start + limitNum);
    }

    return res.status(200).json({
      success: true,
      count: paginated.length,
      totalCount,
      page: limitNum > 0 ? pageNum : 1,
      totalPages: limitNum > 0 ? Math.ceil(totalCount / limitNum) : 1,
      startups: paginated,
    });
  } catch (error) {
    console.error('Error fetching startups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve startups',
      error: error.message,
    });
  }
};

// @desc    Get single startup
// @route   GET /api/startups/:id
// @access  Public
exports.getStartupById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongooseConnected()) {
      const startup = await Startup.findById(id);
      if (!startup) {
        return res.status(404).json({ success: false, message: 'Startup not found' });
      }
      return res.status(200).json({ success: true, startup });
    }

    const startup = memoryStartups.find(s => s._id.toString() === id);
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }
    return res.status(200).json({ success: true, startup });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new startup
// @route   POST /api/startups
// @access  Protected (Admin only)
exports.createStartup = async (req, res) => {
  try {
    const { name, sector, founders, headquarters, yearFounded, totalFunding, logoUrl, website, description } = req.body;

    if (!name || !sector || !founders || !headquarters || !yearFounded || totalFunding === undefined || !logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'All core fields are required: name, sector, founders, headquarters, yearFounded, totalFunding, logoUrl',
      });
    }

    const payload = {
      name: name.trim(),
      sector: sector.trim(),
      founders: founders.trim(),
      headquarters: headquarters.trim(),
      yearFounded: Number(yearFounded),
      totalFunding: Number(totalFunding),
      logoUrl: logoUrl.trim(),
      website: website ? website.trim() : '',
      description: description ? description.trim() : '',
    };

    if (isMongooseConnected()) {
      const newStartup = await Startup.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Startup added successfully!',
        startup: newStartup,
      });
    }

    const newMemStartup = {
      _id: Date.now().toString(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryStartups.unshift(newMemStartup);

    return res.status(201).json({
      success: true,
      message: 'Startup added successfully! (Memory mode)',
      startup: newMemStartup,
    });
  } catch (error) {
    console.error('Error creating startup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create startup',
      error: error.message,
    });
  }
};

// @desc    Update startup
// @route   PUT /api/startups/:id
// @access  Protected (Admin only)
exports.updateStartup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sector, founders, headquarters, yearFounded, totalFunding, logoUrl, website, description } = req.body;

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(sector && { sector: sector.trim() }),
      ...(founders && { founders: founders.trim() }),
      ...(headquarters && { headquarters: headquarters.trim() }),
      ...(yearFounded !== undefined && { yearFounded: Number(yearFounded) }),
      ...(totalFunding !== undefined && { totalFunding: Number(totalFunding) }),
      ...(logoUrl && { logoUrl: logoUrl.trim() }),
      ...(website !== undefined && { website: website.trim() }),
      ...(description !== undefined && { description: description.trim() }),
    };

    if (isMongooseConnected()) {
      const updated = await Startup.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Startup not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Startup updated successfully!',
        startup: updated,
      });
    }

    const index = memoryStartups.findIndex(s => s._id.toString() === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    memoryStartups[index] = {
      ...memoryStartups[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: 'Startup updated successfully! (Memory mode)',
      startup: memoryStartups[index],
    });
  } catch (error) {
    console.error('Error updating startup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update startup',
      error: error.message,
    });
  }
};

// @desc    Delete startup
// @route   DELETE /api/startups/:id
// @access  Protected (Admin only)
exports.deleteStartup = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongooseConnected()) {
      const deleted = await Startup.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Startup not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Startup deleted successfully!',
      });
    }

    const index = memoryStartups.findIndex(s => s._id.toString() === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Startup not found' });
    }

    memoryStartups.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Startup deleted successfully! (Memory mode)',
    });
  } catch (error) {
    console.error('Error deleting startup:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete startup',
      error: error.message,
    });
  }
};
