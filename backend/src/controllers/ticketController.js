const { Ticket, User, Sector, TicketMessage } = require('../models');
const { Op } = require('sequelize');

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, type, priority, sectorId } = req.body;
    const userId = req.user.id; // Assuming user is attached to req by auth middleware
    let assignedConsultantId = null;

    if (type === 'consultant') {
      // Find a consultant in the same sector
      const consultant = await User.findOne({
        where: {
          role: 'consultant',
          sectorId: sectorId,
        },
      });
      if (consultant) {
        assignedConsultantId = consultant.id;
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      type,
      priority,
      userId,
      sectorId,
      consultantId: assignedConsultantId,
      status: 'open',
    });

    if (assignedConsultantId) {
      await TicketMessage.createAssignmentMessage(ticket.id, consultant.firstName + ' ' + consultant.lastName, userId);
    }

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Ticket created successfully'
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'An error occurred while creating ticket',
        details: error.message 
      }
    });
  }
};

// Get all tickets based on user role
exports.getAllTickets = async (req, res) => {
  try {
    const { user } = req; // Assuming user is attached to req by auth middleware
    let whereClause = {};

    if (user.role === 'member') {
      // Members can only see their own tickets
      whereClause.userId = user.id;
    } else if (user.role === 'consultant') {
      // Consultants see tickets assigned to them or open consultant tickets in their sector
      whereClause = {
        [Op.or]: [
          { consultantId: user.id },
          { type: 'consultant', sectorId: user.sector?.id || user.sectorId, status: 'open' }
        ]
      };
    } else if (user.role !== 'admin'){
      // if not admin, and not member or consultant, then unauthorized
        return res.status(403).json({ 
          success: false,
          error: { message: 'Unauthorized' }
        });
    }

    try {
      const tickets = await Ticket.findAll({ 
          where: whereClause,
          include: [
              { 
                model: User, 
                as: 'user', 
                attributes: ['id', 'firstName', 'lastName'],
                required: false
              },
              { 
                model: User, 
                as: 'consultant', 
                attributes: ['id', 'firstName', 'lastName'],
                required: false
              }
          ],
          order: [['createdAt', 'DESC']]
      });
      
      const plainTickets = tickets.map(ticket => ticket.get({ plain: true }));
      
      res.status(200).json({
        success: true,
        data: plainTickets,
        count: plainTickets.length
      });
    } catch (error) {
      console.error('Error in findAll:', error);
      res.status(500).json({ 
        success: false,
        error: { 
          message: 'An error occurred while fetching tickets',
          details: error.message 
        }
      });
    }
  } catch (error) {
    console.error('Error in getAllTickets:', error);
    res.status(500).json({ 
      success: false,
      error: { message: error.message }
    });
  }
};

// Get a specific ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        { 
          model: User, 
          as: 'consultant', 
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Ticket not found' }
      });
    }

    // Check if user has permission to view this ticket
    if (user.role === 'member' && ticket.userId !== user.id) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to view this ticket' }
      });
    }

    if (user.role === 'consultant' && 
        ticket.consultantId !== user.id && 
        ticket.sectorId !== (user.sector?.id || user.sectorId)) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to view this ticket' }
      });
    }

    res.status(200).json({
      success: true,
      data: ticket.get({ plain: true })
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'An error occurred while fetching ticket',
        details: error.message 
      }
    });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const updates = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Ticket not found' }
      });
    }

    // Check if user has permission to update this ticket
    if (user.role === 'member' && ticket.userId !== user.id) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to update this ticket' }
      });
    }

    if (user.role === 'consultant' && 
        ticket.consultantId !== user.id && 
        ticket.sectorId !== (user.sector?.id || user.sectorId)) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to update this ticket' }
      });
    }

    await ticket.update(updates);

    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        { 
          model: User, 
          as: 'consultant', 
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedTicket.get({ plain: true }),
      message: 'Ticket updated successfully'
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'An error occurred while updating ticket',
        details: error.message 
      }
    });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        error: { message: 'Ticket not found' }
      });
    }

    // Check if user has permission to delete this ticket
    if (user.role === 'member' && ticket.userId !== user.id) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to delete this ticket' }
      });
    }

    if (user.role === 'consultant' && 
        ticket.consultantId !== user.id && 
        ticket.sectorId !== (user.sector?.id || user.sectorId)) {
      return res.status(403).json({ 
        success: false,
        error: { message: 'Unauthorized to delete this ticket' }
      });
    }

    await Ticket.destroy({
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ 
      success: false,
      error: { 
        message: 'An error occurred while deleting ticket',
        details: error.message 
      }
    });
  }
};