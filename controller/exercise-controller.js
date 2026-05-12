export const addExercise = (db) => async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) return res.status(400).json({ error: "Missing fields" });
  
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
  const { from, to, limit } = req.query;

  try {
    const user = await db.get('SELECT id, username FROM users WHERE id = ?', [_id]);
    if (!user) return res.status(404).json({ error: "User not found" });

    let sql = 'SELECT id, description, duration, date FROM exercises WHERE user_id = ?';
    let params = [_id];

    if (from) { sql += ' AND date >= ?'; params.push(from); }
    if (to) { sql += ' AND date <= ?'; params.push(to); }

    const allMatching = await db.all(sql, params);
    if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
    const logs = await db.all(sql, params);

    res.json({ ...user, count: allMatching.length, logs });
  } catch (err) {
    console.error('Get Logs Error:', err.message);
    res.status(500).json({ error: "Server Error" });
  }
};