import sequelize, { Provider } from '../src/models.js';
import { seedUser, signToken } from './testUtils.js';

async function setup() {
  if (!sequelize) {
    throw new Error('Sequelize is not configured for tests');
  }

  await sequelize.sync({ force: true });

  const adminUser = await seedUser({
    name: 'Admin User',
    email: 'admin-test@example.com',
    password: 'password123',
    role: 'admin'
  });

  const providerUser = await seedUser({
    name: 'Provider User',
    email: 'provider-test@example.com',
    password: 'password123',
    role: 'provider'
  });

  const providerUser2 = await seedUser({
    name: 'Provider User Two',
    email: 'provider2-test@example.com',
    password: 'password123',
    role: 'provider'
  });

  const clientUser = await seedUser({
    name: 'Client User',
    email: 'client-test@example.com',
    password: 'password123',
    role: 'client'
  });

  const otherClientUser = await seedUser({
    name: 'Other Client',
    email: 'client2-test@example.com',
    password: 'password123',
    role: 'client'
  });

  const providerProfile = await Provider.create({
    user_id: providerUser.id,
    service_name: 'General Service',
    description: 'Baseline provider profile'
  });

  globalThis.__testData = {
    adminUserId: adminUser.id,
    providerUserId: providerUser.id,
    providerUser2Id: providerUser2.id,
    clientUserId: clientUser.id,
    otherClientUserId: otherClientUser.id,
    providerId: providerProfile.id,
    adminToken: signToken(adminUser),
    providerToken: signToken(providerUser),
    clientToken: signToken(clientUser),
    otherClientToken: signToken(otherClientUser)
  };
}

await setup();
