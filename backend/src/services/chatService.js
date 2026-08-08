const chatRepository = require("../repositories/chatRepository");
const { getIO, SOCKET_EVENTS } = require("../sockets");
const prisma = require("../lib/prismaClient");

class ChatService {
  /**
   * Check if a user is a participant of a ride (driver or active passenger).
   * @returns {boolean}
   */
  async _isParticipant(rideId, userId) {
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: {
          where: {
            passengerId: userId,
            status: { in: ["BOOKED", "PAYMENT_COMPLETED"] },
          },
        },
      },
    });

    if (!ride) return { ride: null, isParticipant: false };

    const isDriver = ride.driverId === userId;
    const isPassenger = ride.bookings.length > 0;

    return { ride, isParticipant: isDriver || isPassenger };
  }

  /**
   * Send a message in a ride's chat.
   * Only participants (driver or passengers with active bookings) may post.
   */
  async sendMessage(rideId, senderId, messageText) {
    const { ride, isParticipant } = await this._isParticipant(rideId, senderId);

    if (!ride) {
      const error = new Error("Ride not found");
      error.status = 404;
      throw error;
    }

    if (!isParticipant) {
      const error = new Error(
        "Forbidden: Only the driver or passengers with active bookings can send messages"
      );
      error.status = 403;
      throw error;
    }

    // Insert message
    const chatMessage = await chatRepository.createMessage({
      rideId,
      senderId,
      message: messageText,
    });

    // Emit via Socket.IO — uses the canonical SOCKET_EVENTS constant
    try {
      const io = getIO();
      io.to(`ride:${rideId}`).emit(SOCKET_EVENTS.chatMessage(rideId), {
        id: chatMessage.id,
        rideId,
        senderId,
        senderName: chatMessage.sender.name,
        message: chatMessage.message,
        sentAt: chatMessage.sentAt,
      });
    } catch (socketErr) {
      console.warn("Chat socket emission warning:", socketErr.message);
    }

    return chatMessage;
  }

  /**
   * Get chat history for a ride.
   * Only participants may view.
   */
  async getMessages(rideId, userId) {
    const { ride, isParticipant } = await this._isParticipant(rideId, userId);

    if (!ride) {
      const error = new Error("Ride not found");
      error.status = 404;
      throw error;
    }

    if (!isParticipant) {
      const error = new Error(
        "Forbidden: Only the driver or passengers with active bookings can view messages"
      );
      error.status = 403;
      throw error;
    }

    return chatRepository.findByRideId(rideId);
  }
}

module.exports = new ChatService();
