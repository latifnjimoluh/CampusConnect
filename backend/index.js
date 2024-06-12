// Serveur complet
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 3000;

// Connexion MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MySQL:', err);
    throw err;
  }
  console.log('MySQL connecté...');
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Route de test
app.get('/test', (req, res) => {
  res.send('Le serveur fonctionne');
});

// Route pour récupérer tous les groupes
app.get('/groups', (req, res) => {
  const query = 'SELECT * FROM `user_groups`';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des groupes.', error: err });
    }
    res.status(200).json(results);
  });
});

// Route pour rechercher des groupes
app.get('/groups/search', (req, res) => {
  const { name } = req.query;
  const query = 'SELECT * FROM `user_groups` WHERE `name` LIKE ?';
  const searchValue = `%${name}%`;
  db.query(query, [searchValue], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la recherche des groupes.', error: err });
    }
    res.status(200).json(results);
  });
});


// Route pour créer un groupe via HTTP POST
app.post('/groups', (req, res) => {
  const { name } = req.body;
  const userId = req.session.user.id;
  if (!name || !userId) {
    return res.status(400).json({ message: 'Le nom du groupe et l\'ID utilisateur sont requis.' });
  }
  const query = 'INSERT INTO `user_groups` (name, created_by) VALUES (?, ?)';
  db.query(query, [name, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création du groupe.', error: err });
    }
    const newGroup = { id: result.insertId, name, created_by: userId };
    io.emit('groupCreated', newGroup); // Émettre l'événement à tous les clients
    res.status(201).json({ message: 'Groupe créé avec succès.', group: newGroup });
  });
});

// Route pour supprimer un groupe via HTTP DELETE
app.delete('/groups/:id', (req, res) => {
  const groupId = req.params.id;
  const userId = req.session.user.id;

  // Vérifier si l'utilisateur est le créateur du groupe
  const checkQuery = 'SELECT created_by FROM `user_groups` WHERE id = ?';
  db.query(checkQuery, [groupId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la vérification du groupe.', error: err });
    }
    if (results.length === 0 || results[0].created_by !== userId) {
      return res.status(403).json({ message: 'Seul le créateur peut supprimer ce groupe.' });
    }

    // Supprimer le groupe
    const deleteQuery = 'DELETE FROM `user_groups` WHERE id = ?';
    db.query(deleteQuery, [groupId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la suppression du groupe.', error: err });
      }
      io.emit('groupDeleted', { id: groupId }); // Émettre l'événement à tous les clients
      res.status(200).json({ message: 'Groupe supprimé avec succès.' });
    });
  });
});

// Route pour récupérer les messages d'un groupe
// Route pour récupérer les messages d'un groupe
app.get('/groups/:id/messages', (req, res) => {
  const groupId = req.params.id;
  const query = `
    SELECT messages.*, users.username
    FROM messages
    JOIN users ON messages.userId = users.id
    WHERE messages.groupId = ?
    ORDER BY messages.timestamp DESC
  `;
  db.query(query, [groupId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des messages.', error: err });
    }
    res.status(200).json(results);
  });
});



// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Nouveau client connecté');

  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });

  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
  });

  socket.on('startCall', (groupId) => {
    io.to(groupId).emit('callStarted', { from: socket.id });
  });

  socket.on('webrtcOffer', (data) => {
    io.to(data.to).emit('webrtcOffer', data);
  });

  socket.on('webrtcAnswer', (data) => {
    io.to(data.to).emit('webrtcAnswer', data);
  });

  socket.on('webrtcCandidate', (data) => {
    io.to(data.to).emit('webrtcCandidate', data);
  });

  // Socket.io pour récupérer les messages d'un groupe
socket.on('getGroupMessages', (groupId, callback) => {
  const query = `
    SELECT messages.*, users.username
    FROM messages
    JOIN users ON messages.userId = users.id
    WHERE messages.groupId = ?
    ORDER BY messages.timestamp DESC
  `;
  db.query(query, [groupId], (err, results) => {
    if (err) {
      callback({ error: true, message: 'Erreur lors de la récupération des messages.', error: err });
    } else {
      callback({ error: false, messages: results });
    }
  });
});


  socket.on('sendMessage', (data, callback) => {
    const { groupId, userId, text, imageUri } = data;
    const query = 'INSERT INTO `messages` (groupId, userId, text, imageUri) VALUES (?, ?, ?, ?)';
    db.query(query, [groupId, userId, text, imageUri], (err, result) => {
      if (err) {
        callback({ error: true, message: 'Erreur lors de l\'envoi du message.', error: err });
      } else {
        const message = { id: result.insertId, groupId, userId, text, imageUri, timestamp: new Date() };
        io.to(groupId).emit('messageReceived', message);
        callback({ error: false, message: 'Message sent successfully' });
      }
    });
  });

  socket.on('getGroups', (callback) => {
    const query = 'SELECT * FROM `user_groups`';
    db.query(query, (err, results) => {
      if (err) {
        callback({ error: true, message: 'Erreur lors de la récupération des groupes.', error: err });
      } else {
        callback({ error: false, groups: results });
      }
    });
  });

   // Gestion des appels vidéo
   socket.on('startCall', (groupId) => {
    io.to(groupId).emit('callStarted', { from: socket.id });
  });

  socket.on('webrtcOffer', (data) => {
    io.to(data.to).emit('webrtcOffer', data);
  });

  socket.on('webrtcAnswer', (data) => {
    io.to(data.to).emit('webrtcAnswer', data);
  });

  socket.on('webrtcCandidate', (data) => {
    io.to(data.to).emit('webrtcCandidate', data);
  });


  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// Route d'inscription
app.post('/auth/signup', async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { email, password: hashedPassword, username };

  const query = 'INSERT INTO users SET ?';
  db.query(query, newUser, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.', error: err });
    }

    const userId = result.insertId;
    req.session.user = { id: userId, email, username };
    res.status(201).json({ message: 'Utilisateur créé avec succès.', user: req.session.user });
  });
});

// Route de connexion
app.post('/auth/login', (req, res) => {
  const { username, password, fcmToken } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur du serveur.', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé. Voulez-vous créer un compte ?' });
    }
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect.' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      firstName: user.firstName,
      photoUri: user.photoUri
    };

    if (fcmToken) {
      const tokenQuery = 'INSERT INTO fcm_tokens (userId, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?';
      db.query(tokenQuery, [user.id, fcmToken, fcmToken], (err) => {
        if (err) {
          console.error('Erreur lors de l\'ajout du jeton FCM:', err);
        }
      });
    }

    res.status(200).json({ message: 'Connexion réussie.', user: req.session.user });
  });
});

// Route pour récupérer les détails de l'utilisateur connecté
app.get('/auth/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié.' });
  }
  res.status(200).json(req.session.user);
});

// Route pour mettre à jour les détails de l'utilisateur
app.put('/auth/user', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Utilisateur non authentifié.' });
  }

  const { phone, firstName, gender, dob, country, postalCode, photoUri } = req.body;
  const query = 'UPDATE users SET phone = ?, firstName = ?, gender = ?, dob = ?, country = ?, postalCode = ?, photoUri = ? WHERE id = ?';
  db.query(query, [phone, firstName, gender, dob, country, postalCode, photoUri, req.session.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour des détails utilisateur.', error: err });
    }

    req.session.user = { ...req.session.user, phone, firstName, gender, dob, country, postalCode, photoUri };

    res.status(200).json({ message: 'Informations utilisateur mises à jour avec succès.' });
  });
});

// Route de déconnexion
app.post('/auth/logout', (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.session.user?.id;
  if (userId) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
      }
      if (fcmToken) {
        const query = 'DELETE FROM fcm_tokens WHERE userId = ? AND token = ?';
        db.query(query, [userId, fcmToken], (err) => {
          if (err) {
            console.error('Erreur lors de la suppression du jeton FCM:', err);
          }
        });
      }
      res.status(200).json({ message: 'Déconnexion réussie.' });
    });
  } else {
    return res.status(400).json({ message: 'Vous n\'êtes pas connecté.' });
  }
});


//suite

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
