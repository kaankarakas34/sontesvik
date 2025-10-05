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

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          { type: 'consultant', sectorId: user.sectorId, status: 'open' }
        ]
      };
    } else if (user.role !== 'admin'){
      // if not admin, and not member or consultant, then unauthorized
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const tickets = await Ticket.findAll({ 
        where: whereClause,
        include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'consultant', attributes: ['id', 'firstName', 'lastName'] },
            { model: Sector, as: 'sector', attributes: ['id', 'name'] }
        ]
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
        include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'consultant', attributes: ['id', 'firstName', 'lastName'] },
            { model: Sector, as: 'sector', attributes: ['id', 'name'] }
        ]
    });
    if (ticket) {
      res.status(200).json(ticket);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Ticket.update(req.body, {
      where: { id: id },
    });
    if (updated) {
      const updatedTicket = await Ticket.findByPk(id);
      res.status(200).json(updatedTicket);
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ticket.destroy({
      where: { id: id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};