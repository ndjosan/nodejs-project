export const createUser = (db) => async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "username is required" });

  try {
    const result = await db.run('INSERT INTO users (username) VALUES (?)', [username]);
    res.status(201).json({ username, id: result.lastID });
  } catch (err) {
    console.error('Create User Error:', err.message);
    const status = err.message.includes('UNIQUE') ? 400 : 500;
    res.status(status).json({ error: err.message.includes('UNIQUE') ? "Username exists" : "Server Error" });
  }
};

export const getUsers = (db) => async (req, res) => {
  try {
    const users = await db.all('SELECT id, username FROM users');
    res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err.message);
    res.status(500).json({ error: "Server Error" });
  }
};