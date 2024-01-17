const pg = require('pg');
const bcrypt = require('bcrypt');
const { Client } = pg;

const { dbLogger } = require('./logging.cjs');
const util = require('util');

class Database {
  constructor() {
    this.client = new Client({
      connectionString: process.env.DB_CONNECTION_STRING,
    });
  }

  async connect() {
    try {
      await this.client.connect();
      dbLogger.info('Connected to database');
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async close() {
    try {
      await this.client.end();
      dbLogger.info('Closed database connection');
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async createUser(username, email, password) {
    try {
      const query = `
        INSERT INTO users (username, email, hashed_password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at, updated_at;
      `;
      const values = [username, email, await this.hashPassword(password)];
      const res = await this.client.query(query, values);
      return res.rows[0];
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async getUserByEmail(email) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE email = $1;
      `;
      const values = [email];
      const res = await this.client.query(query, values);
      return res.rows[0];
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async verifyUserPassword(email, password) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return false;
      }
      const passwordMatch = await bcrypt.compare(
        password,
        user.hashed_password,
      );
      return passwordMatch;
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async updateUser(oldEmail, { newUsername, newEmail, newPassword }) {
    try {
      let query = 'UPDATE users SET ';
      const values = [];
      let index = 1;

      if (newUsername) {
        query += `username = $${index}, `;
        values.push(newUsername);
        index++;
      }

      if (newEmail) {
        query += `email = $${index}, `;
        values.push(newEmail);
        index++;
      }

      if (newPassword) {
        query += `hashed_password = $${index}, `;
        values.push(await this.hashPassword(newPassword));
        index++;
      }

      // Ensure at least one field is provided for update
      if (values.length === 0) {
        throw new Error('No update fields provided');
      }

      query = query.slice(0, -2); // Remove the trailing comma and space

      query += ` WHERE email = $${index} RETURNING id, username, email, created_at, updated_at;`;
      values.push(oldEmail);

      const res = await this.client.query(query, values);
      return res.rows[0];
    } catch (err) {
      dbLogger.error(util.format(err));
      throw err;
    }
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = {
  db: new Database(),
  Database,
};

// createUser('user1', 'user1@example.com', 'usersfirstpassword'); // should create a user
// console.log(getUserByEmail('user1@example.com'));
// console.log(updateUser('user1@example.com', { newUsername: 'user2' }));
// console.log(getUserByEmail('user1@example.com'));
// console.log(verifyUserPassword('user1@example.com', 'usersfirstpassword'));
// console.log(verifyUserPassword('user1@example.com', 'userssecondpassword'));
// console.log(updateUser('user1@example.com', { newPassword: 'userssecondpassword' }));
// console.log(verifyUserPassword('user1@example.com', 'userssecondpassword'));
// client.end();

// module.exports = {
//   client: client,
//   connect: () =>
//     client.connect().then(() => dbLogger.info('Connected to database')),
//   createUser,
//   getUserByEmail,
//   verifyUserPassword,
//   updateUser,
//   close: () =>
//     client.end().then(() => dbLogger.info('Closed database connection')),
// };
