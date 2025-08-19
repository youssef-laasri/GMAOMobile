import SQLite from 'react-native-sqlite-storage';

// Enable debugging (optional)
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class LoginInfoService {
  constructor() {
    this.db = null;
  }

  // Initialize database connection
  async initDB() {
    try {
      this.db = await SQLite.openDatabase({
        name: 'LoginInfoDB.db',
        location: 'default',
      });
      
      await this.createTable();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Create table for LoginInfoDTO
  async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS loginInfo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT,
        value TEXT,
        role TEXT,
        username TEXT,
        name TEXT,
        info_supp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.db.executeSql(createTableQuery);
      console.log('Table created successfully');
    } catch (error) {
      console.error('Table creation failed:', error);
      throw error;
    }
  }



  // Insert a new LoginInfoDTO
  async insertLoginInfo(LoginInfo) {
    const insertQuery = `
      INSERT INTO loginInfo (status, value, role, username, name, info_supp)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const params = [
      LoginInfo.status || null,
      LoginInfo.value || null,
      LoginInfo.role || null,
      LoginInfo.username || null,
      LoginInfo.name || null,
      LoginInfo.infoSupp ? JSON.stringify(LoginInfo.infoSupp) : null,
    ];

    try {
      const result = await this.db.executeSql(insertQuery, params);
      const insertedId = result[0].insertId;
      console.log('LoginInfo inserted with ID:', insertedId);
      return insertedId;
    } catch (error) {
      console.error('Insert failed:', error);
      throw error;
    }
  }

  // Get LoginInfos by username
  async getLoginInfosByUsername(username) {
    const selectQuery = 'SELECT * FROM loginInfo WHERE username = ? ORDER BY created_at DESC;';

    try {
      const result = await this.db.executeSql(selectQuery, [username]);
      const rows = result[0].rows.raw();
      
      return rows.map(row => ({
        id: row.id,
        status: row.status,
        value: row.value,
        role: row.role,
        username: row.username,
        name: row.name,
        infoSupp: row.info_supp ? JSON.parse(row.info_supp) : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Select by username failed:', error);
      throw error;
    }
  }

  // Update LoginInfo
  async updateLoginInfo(id, LoginInfo) {
    const updateQuery = `
      UPDATE loginInfo 
      SET status = ?, value = ?, role = ?, username = ?, name = ?, info_supp = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;

    const params = [
      LoginInfo.status || null,
      LoginInfo.value || null,
      LoginInfo.role || null,
      LoginInfo.username || null,
      LoginInfo.name || null,
      LoginInfo.infoSupp ? JSON.stringify(LoginInfo.infoSupp) : null,
      id,
    ];

    try {
      const result = await this.db.executeSql(updateQuery, params);
      console.log('LoginInfo updated, rows affected:', result[0].rowsAffected);
      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }

  // Delete LoginInfo by ID
  async deleteLoginInfo(id) {
    const deleteQuery = 'DELETE FROM loginInfo WHERE id = ?;';

    try {
      const result = await this.db.executeSql(deleteQuery, [id]);
      console.log('LoginInfo deleted, rows affected:', result[0].rowsAffected);
      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }


  // Close database connection
  async closeDB() {
    if (this.db) {
      try {
        await this.db.close();
        console.log('Database closed successfully');
      } catch (error) {
        console.error('Database close failed:', error);
      }
    }
  }
}