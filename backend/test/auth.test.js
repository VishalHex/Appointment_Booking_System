import { expect } from 'chai';
import { registerUser, authenticateUser } from '../src/auth.js';
import { User } from '../src/models.js';

describe('Auth Module', () => {
  before(async () => {
    await User.sync({ force: true });
  });

  it('should register a new user', async () => {
    const user = await registerUser({ name: 'Test', email: 'test@example.com', password: 'password123', role: 'client' });
    expect(user).to.have.property('id');
    expect(user.email).to.equal('test@example.com');
  });

  it('should authenticate a user and return a token', async () => {
    const result = await authenticateUser('test@example.com', 'password123');
    expect(result).to.have.property('token');
    expect(result.user.email).to.equal('test@example.com');
  });

  it('should fail authentication with wrong password', async () => {
    const result = await authenticateUser('test@example.com', 'wrongpass');
    expect(result).to.be.null;
  });
});
