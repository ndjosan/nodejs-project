export const addExercise = (db) => async (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;

  if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required!' })
  }
  
  duration = parseInt(duration);
  if (Number.isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive number!' })
  }
  
  const dateObj = date ? new Date(date) : new Date();
  if (isNaN(dateObj.getTime())) return res.status(400).json({ error: "Invalid date" });
  const dateString = dateObj.toISOString().split('T')[0];

  try {
    const user = await db.get('SELECT id FROM users WHERE id = ?', [_id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    const result = await db.run(
      'INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)',
      [_id, description, parseInt(duration), dateString]
    );

    res.json({ userId: parseInt(_id), exerciseId: result.lastID, description, duration: parseInt(duration), date: dateString });
  } catch (err) {
    console.error('Add Exercise Error:', err.message);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getLogs = (db) => async (req, res) => {
  const { _id } = req.params;
  let { from, to, limit } = req.query;

  if (limit) {
    limit = parseInt(limit);
    if (Number.isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: "Limit must be a positive number!" });
    }
  }

  if (from) {
    const fromObj = new Date(from);
    if (isNaN(fromObj.getTime())) {
      return res.status(400).json({ error: "Invalid 'from' date" });
    }
    from = fromObj.toISOString().split('T')[0];
  }

  if (to) {
    const toObj = new Date(to);
    if (isNaN(toObj.getTime())) {
      return res.status(400).json({ error: "Invalid 'to' date" });
    }
    to = toObj.toISOString().split('T')[0];
  }

  try {
    const user = await db.get('SELECT id, username FROM users WHERE id = ?', [_id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    let sql = 'SELECT description, duration, date FROM exercises WHERE user_id = ?';
    let params = [_id];

    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }

    sql += ' ORDER BY date ASC';

    const allLogs = await db.all(sql, params);
    const count = allLogs.length;

    if (limit) { 
      sql += ' LIMIT ?'; 
      params.push(parseInt(limit)); 
    }

    const logs = await db.all(sql, params);

    res.json({
      _id: user.id,
      username: user.username,
      count: count,
      log: logs
    });
  } catch (err) {
    console.error('Get Logs Error:', err.message);
    res.status(500).json({ error: "Server Error" });
  }
};