const express = require('express');
const router = express.Router();
const { createTicket, getAllTickets, getTicketById, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getAllTickets);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

module.exports = router;