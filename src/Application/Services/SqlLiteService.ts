import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { ImmeubleDTO } from '../ApiCalls';

enablePromise(true);

export const SqlLIteService = {
  getDBConnection: async () => {
    return openDatabase({ name: 'GMAO.db', location: 'default' });
  },

  checkIfTableExists: async (db, tableName) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
          [tableName],
          (_, results) => {
            if (results.rows.length > 0) {
              resolve(true); // Table exists
            } else {
              resolve(false); // Table does not exist
            }
          },
          (_, error) => {
            console.error("Error checking table existence:", error);
            reject(error);
            return false;
          }
        );
      });
    });
  },

  createImmeubleTable: async (db: SQLiteDatabase) => {
    await db.executeSql(`
    CREATE TABLE IF NOT EXISTS immeubles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      adresse TEXT,
      adresse_2 TEXT,
      angle_rue TEXT,
      cp TEXT,
      ville TEXT,
      situation TEXT,
      acces_specifique TEXT,
      horaire_Loge TEXT,
      gardien TEXT,
      tel_Gardien TEXT,
      tel_Portable_Gardien TEXT,
      fax_Gardien TEXT,
      gardien_2 TEXT,
      tel_Gardien_2 TEXT,
      tel_Portable_Gardien_2 TEXT,
      fax_Gardien_2 TEXT,
      boite_cle TEXT,
      code_1 TEXT,
      code_2 TEXT,
      code_3 TEXT,
      commercial TEXT,
      depanneur TEXT,
      type_contrat TEXT,
      energie TEXT,
      president_conseil_syndical TEXT,
      commentaire_technique TEXT,
      vingtquatre TEXT,
      amiante_DTA TEXT,
      canon TEXT,
      prioritaire INTEGER,
      latitude TEXT,
      longitude TEXT,
      chaud_condensation INTEGER
    );
  `);
  },

  getImmeubles: async (db: SQLiteDatabase, offset = 0, limit = 100) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM immeubles LIMIT ? OFFSET ?;`,
          [limit, offset],
          (_, results) => {
            const items = [];
            let result: ImmeubleDTO;
            for (let i = 0; i < results.rows.length; i++) {
              result = { immeubleInfo: results.rows.item(i), tvaInfo: undefined, personnelInfo: undefined }
              items.push(result);
            }
            resolve(items);
          },
          (_, error) => {
            console.error("Pagination fetch error:", error);
            reject(error);
          }
        );
      });
    });
  },

  getNbrsOfImmeubles: async (db: SQLiteDatabase) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT COUNT(*) as count FROM immeubles;`,
          [],
          (_, result) => {
            const count = result.rows.item(0).count;
            resolve(count);
          },
          (_, error) => {
            console.error("Error getting row count:", error);
            reject(error);
          }
        );
      });
    });
  },

  getImmeublesWhere: async (db, column, value) => {
    try {
      const query = `SELECT * FROM immeubles WHERE ${column} = ?`;
      const [results] = await db.executeSql(query, [value]);

      const items = [];
      const rows = results.rows;
      for (let i = 0; i < rows.length; i++) {
        items.push(rows.item(i));
      }

      return items; // array of matched rows
    } catch (error) {
      console.error(`Failed to get immeubles where ${column} = ${value}:`, error);
      return [];
    }
  },

  // Search for buildings where code_immeuble matches the search text
  searchImmeubles: async (db, column, value) => {
    try {
      const query = `SELECT * FROM immeubles WHERE code LIKE ? `;
      const [results] = await db.executeSql(query, [`%${value}%`]);
      const items = [];
      const rows = results.rows;
      for (let i = 0; i < rows.length; i++) {
        items.push(rows.item(i));
      }

      return items; // array of matched rows
    } catch (error) {
      console.error(`Failed to get immeubles where ${column} = ${value}:`, error);
      return [];
    }
  },

  insertImmeuble: async (db: SQLiteDatabase, immeubleInfo) => {

    await db.executeSql(
      `INSERT INTO immeubles (
      code, adresse, adresse_2, angle_rue, cp, ville, situation, acces_specifique,
      horaire_Loge, gardien, tel_Gardien, tel_Portable_Gardien, fax_Gardien,
      gardien_2, tel_Gardien_2, tel_Portable_Gardien_2, fax_Gardien_2,
      boite_cle, code_1, code_2, code_3, commercial, depanneur, type_contrat,
      energie, president_conseil_syndical, commentaire_technique, vingtquatre,
      amiante_DTA, canon, prioritaire, latitude, longitude, chaud_condensation
    ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        immeubleInfo.code,
        immeubleInfo.adresse,
        immeubleInfo.adresse_2,
        immeubleInfo.angle_rue,
        immeubleInfo.cp,
        immeubleInfo.ville,
        immeubleInfo.situation,
        immeubleInfo['accès_specifique'],
        immeubleInfo.horaire_Loge,
        immeubleInfo.gardien,
        immeubleInfo.tel_Gardien,
        immeubleInfo.tel_Portable_Gardien,
        immeubleInfo.fax_Gardien,
        immeubleInfo.gardien_2,
        immeubleInfo.tel_Gardien_2,
        immeubleInfo.tel_Portable_Gardien_2,
        immeubleInfo.fax_Gardien_2,
        immeubleInfo['boite_clé'],
        immeubleInfo.code_1,
        immeubleInfo.code_2,
        immeubleInfo.code_3,
        immeubleInfo.commercial,
        immeubleInfo['dépanneur'],
        immeubleInfo.type_contrat,
        immeubleInfo.energie,
        immeubleInfo['président_du_conseil_syndical'],
        immeubleInfo.commentaire_technique,
        immeubleInfo.vingtquatre,
        immeubleInfo.amiante_DTA,
        immeubleInfo['__Canon'],
        immeubleInfo['__Prioritaire'],
        immeubleInfo['__Latitude'],
        immeubleInfo['__Longitude'],
        immeubleInfo['__ChaudCondensation']
      ]
    );
  },

  deleteImmeublesWhere: async (db, column, value) => {
    try {
      const query = `DELETE FROM immeubles WHERE ${column} = ?`;
      await db.executeSql(query, [value]);
      console.log(`Deleted immeubles where ${column} = ${value}`);
    } catch (error) {
      console.error(`Failed to delete immeubles where ${column} = ${value}:`, error);
    }
  },

  updateImmeubleWhere: async (db, updateFields, conditionField, conditionValue) => {
    try {
      const keys = Object.keys(updateFields);
      const values = Object.values(updateFields);

      // Construct SET clause: "field1 = ?, field2 = ?"
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE immeubles SET ${setClause} WHERE ${conditionField} = ?`;

      // Final values: update values + condition value
      await db.executeSql(sql, [...values, conditionValue]);
      console.log(`Updated immeubles where ${conditionField} = ${conditionValue}`);
    } catch (error) {
      console.error('Failed to update immeuble:', error);
    }
  },

  // Check if immeuble exists by code
  checkImmeubleExists: async (db: SQLiteDatabase, code: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT COUNT(*) as count FROM immeubles WHERE code = ?;`,
          [code],
          (_, result) => {
            const count = result.rows.item(0).count;
            resolve(count > 0);
          },
          (_, error) => {
            console.error('Error checking immeuble existence:', error);
            reject(error);
          }
        );
      });
    });
  },

  // Get immeuble by code
  getImmeubleByCode: async (db: SQLiteDatabase, code: string) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM immeubles WHERE code = ?;`,
          [code],
          (_, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error getting immeuble by code:', error);
            reject(error);
          }
        );
      });
    });
  },

  // Update existing immeuble
  updateImmeuble: async (db: SQLiteDatabase, immeubleInfo) => {
    try {
      await db.executeSql(
        `UPDATE immeubles SET 
          adresse = ?, adresse_2 = ?, angle_rue = ?, cp = ?, ville = ?, 
          situation = ?, acces_specifique = ?, horaire_Loge = ?, gardien = ?, 
          tel_Gardien = ?, tel_Portable_Gardien = ?, fax_Gardien = ?, 
          gardien_2 = ?, tel_Gardien_2 = ?, tel_Portable_Gardien_2 = ?, 
          fax_Gardien_2 = ?, boite_cle = ?, code_1 = ?, code_2 = ?, code_3 = ?, 
          commercial = ?, depanneur = ?, type_contrat = ?, energie = ?, 
          president_conseil_syndical = ?, commentaire_technique = ?, vingtquatre = ?, 
          amiante_DTA = ?, canon = ?, prioritaire = ?, latitude = ?, longitude = ?, 
          chaud_condensation = ?
        WHERE code = ?;`,
        [
          immeubleInfo.adresse,
          immeubleInfo.adresse_2,
          immeubleInfo.angle_rue,
          immeubleInfo.cp,
          immeubleInfo.ville,
          immeubleInfo.situation,
          immeubleInfo['accès_specifique'],
          immeubleInfo.horaire_Loge,
          immeubleInfo.gardien,
          immeubleInfo.tel_Gardien,
          immeubleInfo.tel_Portable_Gardien,
          immeubleInfo.fax_Gardien,
          immeubleInfo.gardien_2,
          immeubleInfo.tel_Gardien_2,
          immeubleInfo.tel_Portable_Gardien_2,
          immeubleInfo.fax_Gardien_2,
          immeubleInfo['boite_clé'],
          immeubleInfo.code_1,
          immeubleInfo.code_2,
          immeubleInfo.code_3,
          immeubleInfo.commercial,
          immeubleInfo['dépanneur'],
          immeubleInfo.type_contrat,
          immeubleInfo.energie,
          immeubleInfo['président_du_conseil_syndical'],
          immeubleInfo.commentaire_technique,
          immeubleInfo.vingtquatre,
          immeubleInfo.amiante_DTA,
          immeubleInfo['__Canon'],
          immeubleInfo['__Prioritaire'],
          immeubleInfo['__Latitude'],
          immeubleInfo['__Longitude'],
          immeubleInfo['__ChaudCondensation'],
          immeubleInfo.code // WHERE clause
        ]
      );
      console.log(`Updated immeuble with code: ${immeubleInfo.code}`);
    } catch (error) {
      console.error('Failed to update immeuble:', error);
      throw error;
    }
  },

  // Sync immeubles - insert or update based on existence
  syncImmeubles: async (db: SQLiteDatabase, immeublesList: any[]) => {
    try {
      console.log(`Starting sync for ${immeublesList.length} immeubles...`);
      let inserted = 0;
      let updated = 0;
      let errors = 0;

      for (const immeuble of immeublesList) {
        try {
          const exists = await SqlLIteService.checkImmeubleExists(db, immeuble.code);
          
          if (exists) {
            // Update existing immeuble
            await SqlLIteService.updateImmeuble(db, immeuble);
            updated++;
            console.log(`Updated immeuble: ${immeuble.code}`);
          } else {
            // Insert new immeuble
            await SqlLIteService.insertImmeuble(db, immeuble);
            inserted++;
            console.log(`Inserted new immeuble: ${immeuble.code}`);
          }
        } catch (error) {
          console.error(`Error syncing immeuble ${immeuble.code}:`, error);
          errors++;
        }
      }

      console.log(`Sync completed: ${inserted} inserted, ${updated} updated, ${errors} errors`);
      return { inserted, updated, errors };
    } catch (error) {
      console.error('Sync immeubles failed:', error);
      throw error;
    }
  },

  deleteTable: async (db: SQLiteDatabase, tableName) => {
    const query = `drop table ${tableName}`;

    await db.executeSql(query);
  },

  // Create table for LoginInfoDTO
  async createLoginInfoTable(db: SQLiteDatabase) {
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
      await db.executeSql(createTableQuery);
      console.log('Table created successfully');
    } catch (error) {
      console.error('Table creation failed:', error);
      throw error;
    }
  },
  // Insert a new LoginInfoDTO
  insertLoginInfo: async (db: SQLiteDatabase, LoginInfo) => {
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
      const result = await db.executeSql(insertQuery, params);
      const insertedId = result[0].insertId;
      console.log('LoginInfo inserted with ID:', insertedId);
      return insertedId;
    } catch (error) {
      console.error('Insert failed:', error);
      throw error;
    }
  },

  // Get LoginInfos by username
  getLoginInfosByUsername: async (db: SQLiteDatabase, username) => {
    const selectQuery = 'SELECT * FROM loginInfo WHERE username = ? ORDER BY created_at DESC;';

    try {
      const result = await db.executeSql(selectQuery, [username]);
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
  },
  getLastRow : async (db: SQLiteDatabase) => {
    try {
      const result = await db.executeSql(
        'SELECT * FROM loginInfo ORDER BY created_at DESC LIMIT 1'
      );

      if (result[0].rows.length > 0) {
        const lastRow = result[0].rows.item(0);
        console.log(lastRow, 'lastRow');
        
        return lastRow;
      }
      return null;
    } catch (error) {
      console.error('Error getting last row:', error);
      throw error;
    }
  },
  // Update LoginInfo
  updateLoginInfo: async (db: SQLiteDatabase, id, LoginInfo) => {
    const updateQuery = `
      UPDATE loginInfo 
      SET status = ?, value = ?, role = ?, username = ?, name = ?, info_supp = ?, updated_at = CURRENT_TIMESTAMP
      WHERE username = ?;
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
      const result = await db.executeSql(updateQuery, params);
      console.log('LoginInfo updated, rows affected:', result[0].rowsAffected);
      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  },

  // Delete LoginInfo by ID
  deleteLoginInfo: async (db: SQLiteDatabase, id) => {
    const deleteQuery = 'DELETE FROM loginInfo WHERE username = ?;';

    try {
      const result = await db.executeSql(deleteQuery, [id]);
      console.log('LoginInfo deleted, rows affected:', result[0].rowsAffected);
      return result[0].rowsAffected > 0;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }
}