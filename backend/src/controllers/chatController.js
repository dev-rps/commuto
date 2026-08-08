const chatService = require("../services/chatService");

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const message = await chatService.sendMessage(
        req.params.id,
        req.user.id,
        req.body.message
      );
      res.status(201).json({ message });
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await chatService.getMessages(
        req.params.id,
        req.user.id
      );
      res.json({ messages });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ChatController();
