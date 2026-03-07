import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';

dotenv.config();

const router = express.Router();

// Database connection for User Data Service (separate from Auth Service)
const userDataDb = mysql.createPool({
  host: process.env.USER_DATA_DB_HOST || 'localhost',
  user: process.env.USER_DATA_DB_USER || 'root',
  password: process.env.USER_DATA_DB_PASSWORD || '',
  database: process.env.USER_DATA_DB_NAME || 'nyaaya_user_data',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
const initializeUserDataDb = async () => {
  try {
    await userDataDb.execute(`
      CREATE TABLE IF NOT EXISTS user_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        data_type VARCHAR(50) NOT NULL,
        data JSON NOT NULL,
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_data_type (data_type),
        INDEX idx_state (state)
      )
    `);
    console.log('User Data database initialized');
  } catch (error) {
    console.error('Error initializing user data database:', error);
  }
};

initializeUserDataDb();

// POST /user-data/save
router.post('/save', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data_type, data, state } = req.body;
    const userId = req.user!.userId;

    // Input validation
    if (!data_type || !data) {
      return res.status(400).json({ error: 'data_type and data are required' });
    }

    if (!Array.isArray(data) && typeof data !== 'object') {
      return res.status(400).json({ error: 'data must be a valid JSON object or array' });
    }

    // Save user data
    const [result] = await userDataDb.execute(
      'INSERT INTO user_data (user_id, data_type, data, state) VALUES (?, ?, ?, ?)',
      [userId, data_type, JSON.stringify(data), state || null]
    );

    const insertResult = result as mysql.ResultSetHeader;
    
    res.status(201).json({
      message: 'User data saved successfully',
      id: insertResult.insertId,
      user_id: userId,
      data_type,
      state
    });

  } catch (error) {
    console.error('Save user data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /user-data/:userId
router.get('/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.userId;
    const userIdNum = Array.isArray(userId) ? parseInt(userId[0]) : parseInt(userId);

    // Users can only access their own data
    if (userIdNum !== currentUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data_type, state, limit = '50', offset = '0' } = req.query;

    let query = 'SELECT * FROM user_data WHERE user_id = ?';
    const params: any[] = [userIdNum];

    if (data_type) {
      query += ' AND data_type = ?';
      params.push(data_type);
    }

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit.toString()), parseInt(offset.toString()));

    const [userData] = await userDataDb.execute(query, params);

    // Parse JSON data for each record
    const parsedUserData = (userData as any[]).map(record => ({
      ...record,
      data: JSON.parse(record.data)
    }));

    res.json({
      user_data: parsedUserData,
      total: parsedUserData.length
    });

  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /user-data/update/:id
router.put('/update/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { data, state } = req.body;
    const userId = req.user!.userId;
    const idNum = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);

    // Input validation
    if (!data) {
      return res.status(400).json({ error: 'data is required' });
    }

    // First check if the record belongs to the user
    const [existingRecords] = await userDataDb.execute(
      'SELECT id FROM user_data WHERE id = ? AND user_id = ?',
      [idNum, userId]
    );

    if (!Array.isArray(existingRecords) || existingRecords.length === 0) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    // Update the record
    const updateFields = ['data = ?', 'updated_at = CURRENT_TIMESTAMP'];
    const updateParams: any[] = [JSON.stringify(data)];

    if (state !== undefined) {
      updateFields.push('state = ?');
      updateParams.push(state);
    }

    updateParams.push(idNum, userId);

    const [result] = await userDataDb.execute(
      `UPDATE user_data SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      [...updateParams, idNum, userId]
    );

    res.json({
      message: 'User data updated successfully',
      id: idNum
    });

  } catch (error) {
    console.error('Update user data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /user-data/delete/:id
router.delete('/delete/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Delete the record if it belongs to the user
    const [result] = await userDataDb.execute(
      'DELETE FROM user_data WHERE id = ? AND user_id = ?',
      [parseInt(id.toString()), userId]
    );

    const deleteResult = result as mysql.ResultSetHeader;
    
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found or access denied' });
    }

    res.json({
      message: 'User data deleted successfully',
      id: parseInt(id.toString())
    });

  } catch (error) {
    console.error('Delete user data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /user-data/summary/:userId
router.get('/summary/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.userId;
    const userIdNum = Array.isArray(userId) ? parseInt(userId[0]) : parseInt(userId);

    // Users can only access their own data
    if (userIdNum !== currentUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get summary statistics
    const [summary] = await userDataDb.execute(`
      SELECT 
        data_type,
        state,
        COUNT(*) as count,
        MAX(created_at) as last_updated
      FROM user_data 
      WHERE user_id = ?
      GROUP BY data_type, state
      ORDER BY count DESC
    `, [userIdNum]);

    res.json({
      summary: summary,
      user_id: userIdNum
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
