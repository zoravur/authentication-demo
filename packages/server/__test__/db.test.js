const { Database } = require('../src/db.cjs');

describe('Database Operations', () => {
  let db;
  beforeAll(async () => {
    db = new Database();
    await db.connect();
    await db.client.query('DELETE FROM public.users WHERE TRUE;');
    // Setup that needs to run before all tests, if any
  });

  afterAll(async () => {
    // Cleanup that needs to run after all tests, if any
    await db.close();
  });

  it('should return undefined for getUserByEmail with nonexistent email', async () => {
    const user = await db.getUserByEmail('user1@example.com');
    expect(user).toBeUndefined();
  });

  it('should create a new user with createUser', async () => {
    const result = await db.createUser(
      'user1',
      'user1@example.com',
      'usersfirstpassword',
    );
    expect(result).toBeTruthy(); // Adjust according to what createUser returns
  });

  it('should retrieve the correct user with getUserByEmail', async () => {
    const user = await db.getUserByEmail('user1@example.com');
    expect(user).toBeDefined();
    expect(user.email).toBe('user1@example.com');
  });

  it('should return false for verifyUserPassword with incorrect password', async () => {
    const result = await db.verifyUserPassword(
      'user1@example.com',
      'usersincorrectpassword',
    );
    expect(result).toBe(false);
  });

  it('should return true for verifyUserPassword with correct password', async () => {
    const result = await db.verifyUserPassword(
      'user1@example.com',
      'usersfirstpassword',
    );
    expect(result).toBe(true);
  });

  it('should update user details with updateUser', async () => {
    await db.updateUser('user1@example.com', { newUsername: 'user2' });
    const updatedUser = await db.getUserByEmail('user1@example.com');
    expect(updatedUser.username).toBe('user2');
  });

  // Add more tests as needed
});

// TODO:
// - research testing frameworks https://chat.openai.com/c/e8b3e494-7f3b-4919-b6c2-c7f40f486d85
// - Unit testing
// - Integration testing
// - End-to-end testing
// Mainly just creating this file so that I can keep track of the tests I come up with as I'm writing the code.

// ensure that these have the correct outputs.
// await createUser('user1', 'user1@example.com', 'usersfirstpassword'); // should create a user
// console.log(await getUserByEmail('user1@example.com')); // should return user
// console.log(await verifyUserPassword('user1@example.com', 'usersincorrectpassword')); // should return false
// console.log(await verifyUserPassword('user1@example.com', 'usersfirstpassword')); // should return true

// console.log(await getUserByEmail('user1@example.com'));
// console.log(await updateUser('user1@example.com', { newUsername: 'user2' }));
// console.log(await getUserByEmail('user1@example.com'));
// console.log(await verifyUserPassword('user1@example.com', 'usersfirstpassword'));
// console.log(await verifyUserPassword('user1@example.com', 'userssecondpassword'));
// console.log(await updateUser('user1@example.com', { newPassword: 'userssecondpassword' }));
// console.log(await verifyUserPassword('user1@example.com', 'userssecondpassword'));
// client.end();
