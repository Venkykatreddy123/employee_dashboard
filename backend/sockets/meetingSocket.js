const Meeting = require('../models/meetingModel');

const jwt = require('jsonwebtoken');

const meetingSocket = (io) => {
  // Middleware: Authentication Handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.log("❌ [Socket Auth] Identity Token Missing");
      return next(new Error("Authentication error: Missing token"));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
      socket.user = user;
      console.log(`✅ [Socket Auth] User ${user.email} Verified`);
      next();
    } catch (err) {
      console.log("❌ [Socket Auth] Invalid Token Protocol");
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New node connection: ${socket.id}`);

    // Join a specific meeting room
    socket.on('join-room', async ({ meeting_id, user }) => {
      socket.join(meeting_id);
      console.log(`👤 User ${user.name} joined room: ${meeting_id}`);
      
      // Update DB that user joined
      try {
        await Meeting.joinMeeting(meeting_id, user.emp_id);
        
        // Notify others in the room
        socket.to(meeting_id).emit('user-joined', { 
          user, 
          timestamp: new Date() 
        });
        
        // Send current active participants list
        const participants = await Meeting.getParticipants(meeting_id);
        io.to(meeting_id).emit('participants-update', participants);
      } catch (err) {
        console.error('Socket join-room error:', err.message);
      }
    });

    // Leave room
    socket.on('leave-room', async ({ meeting_id, user }) => {
      socket.leave(meeting_id);
      console.log(`👤 User ${user.name} left room: ${meeting_id}`);
      
      try {
        await Meeting.leaveMeeting(meeting_id, user.emp_id);
        
        socket.to(meeting_id).emit('user-left', { 
          user, 
          timestamp: new Date() 
        });
        
        const participants = await Meeting.getParticipants(meeting_id);
        io.to(meeting_id).emit('participants-update', participants);
      } catch (err) {
        console.error('Socket leave-room error:', err.message);
      }
    });

    // Send Message
    socket.on('send-message', async ({ meeting_id, sender_id, sender_name, message }) => {
      try {
        // Save to DB
        await Meeting.saveMessage(meeting_id, sender_id, message);
        
        const messageData = {
          meeting_id,
          sender_id,
          sender_name,
          message,
          timestamp: new Date()
        };
        
        // Broadcast to everyone in the room (including sender)
        io.to(meeting_id).emit('receive-message', messageData);
        console.log(`💬 Message in ${meeting_id} from ${sender_name}`);
      } catch (err) {
        console.error('Socket send-message error:', err.message);
      }
    });

    // Meeting status update (Live/Ended)
    socket.on('update-meeting-status', async ({ meeting_id, status }) => {
      try {
        await Meeting.updateStatus(meeting_id, status);
        io.emit('meeting-updated', { meeting_id, status });
        console.log(`📢 Meeting ${meeting_id} status changed to ${status}`);
      } catch (err) {
        console.error('Socket meeting-update error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Node disconnected: ${socket.id}`);
    });
  });

  // Global broadcast helper for HTTP controllers
  return {
    broadcastMeetingCreated: (meeting) => {
      io.emit('meeting-created', meeting);
    }
  };
};

module.exports = meetingSocket;
