require('dotenv').config();
// import request from 'supertest';
const request = require('supertest');
const { db } = require('../db.cjs');

// TODO: replace with unit tests
const app = 'http://localhost:3000';

// (async function main() {
//   await db.connect();
//   await db.client.query('DELETE FROM public.users WHERE TRUE;');
//   await db.createUser('testuser', 'testuser@example.com', 'testpassword');

//   const response = await request(app).post('/api/users/signin').send({
//     email: 'testuser@example.com',
//     password: 'testpassword',
//   });

//   console.log(response);

//   await db.close();
// })();

(async function main() {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjY3Nzg4MSwiZXhwIjoxNzAyNjgxNDgxfQ.IJXapUZ40uZibk2KvmHwOTTlQhNw0Tszu-FvJ-cy9xI';
  const response = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${token}`);

  console.log(response._body);
})();
