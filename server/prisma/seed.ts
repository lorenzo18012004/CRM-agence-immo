import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing data (except users and agencies)
  console.log('🧹 Cleaning up existing data...');
  await prisma.appointment.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.client.deleteMany({});
  console.log('✅ Data cleaned');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedPasswordAgent = await bcrypt.hash('agent123', 10);

  // Create super admin (no agency, can manage all agencies)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@crm.local' },
    update: {},
    create: {
      email: 'superadmin@crm.local',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      agencyId: null,
    },
  });

  console.log('✅ Super admin created:', superAdmin.email);

  // ========== AGENCE 1 ==========
  const agency1 = await prisma.agency.upsert({
    where: { id: 'default' },
    update: {
      code: '6165',
    },
    create: {
      id: 'default',
      code: '6165',
      name: 'Mon Agence Immobilière',
      email: 'contact@agence.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la République',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      isActive: true,
    },
  });

  console.log('✅ Agency 1 created:', agency1.name, '(Code:', agency1.code + ')');

  // Create admin user (gérant) for agency 1
  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Pierre',
      lastName: 'Dubois',
      role: 'ADMIN',
      agencyId: agency1.id,
      phone: '+33 6 12 34 56 78',
    },
  });

  console.log('✅ Admin 1 created:', admin1.email);

  // Create 4 agents for agency 1
  const agents1 = [
    {
      email: 'marie.martin@example.com',
      firstName: 'Marie',
      lastName: 'Martin',
      phone: '+33 6 23 45 67 89',
    },
    {
      email: 'jean.dupont@example.com',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33 6 34 56 78 90',
    },
    {
      email: 'sophie.bernard@example.com',
      firstName: 'Sophie',
      lastName: 'Bernard',
      phone: '+33 6 45 67 89 01',
    },
    {
      email: 'thomas.leroy@example.com',
      firstName: 'Thomas',
      lastName: 'Leroy',
      phone: '+33 6 56 78 90 12',
    },
  ];

  const createdAgents1 = [];
  for (const agentData of agents1) {
    const agent = await prisma.user.upsert({
      where: { email: agentData.email },
      update: {},
      create: {
        email: agentData.email,
        password: hashedPasswordAgent,
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        phone: agentData.phone,
        role: 'AGENT',
        agencyId: agency1.id,
      },
    });
    createdAgents1.push(agent);
    console.log('✅ Agent 1 created:', agent.email);
  }

  // Create clients for agency 1
  const clients1 = [
    {
      firstName: 'Alain',
      lastName: 'Moreau',
      email: 'alain.moreau@email.com',
      phone: '+33 6 11 22 33 44',
      address: '45 Avenue des Champs',
      city: 'Paris',
      postalCode: '75008',
      clientType: 'BUYER' as const,
      userId: admin1.id,
      agencyId: agency1.id,
    },
    {
      firstName: 'Catherine',
      lastName: 'Lefebvre',
      email: 'catherine.lefebvre@email.com',
      phone: '+33 6 22 33 44 55',
      address: '12 Rue de la Paix',
      city: 'Lyon',
      postalCode: '69001',
      clientType: 'SELLER' as const,
      userId: createdAgents1[0].id,
      agencyId: agency1.id,
    },
    {
      firstName: 'Marc',
      lastName: 'Garcia',
      email: 'marc.garcia@email.com',
      phone: '+33 6 33 44 55 66',
      address: '78 Boulevard Saint-Michel',
      city: 'Paris',
      postalCode: '75006',
      clientType: 'BUYER' as const,
      userId: createdAgents1[1].id,
      agencyId: agency1.id,
    },
    {
      firstName: 'Isabelle',
      lastName: 'Petit',
      email: 'isabelle.petit@email.com',
      phone: '+33 6 44 55 66 77',
      address: '23 Rue de Rivoli',
      city: 'Marseille',
      postalCode: '13001',
      clientType: 'TENANT' as const,
      userId: createdAgents1[2].id,
      agencyId: agency1.id,
    },
    {
      firstName: 'David',
      lastName: 'Robert',
      email: 'david.robert@email.com',
      phone: '+33 6 55 66 77 88',
      address: '56 Avenue de la République',
      city: 'Toulouse',
      postalCode: '31000',
      clientType: 'LANDLORD' as const,
      userId: createdAgents1[3].id,
      agencyId: agency1.id,
    },
  ];

  const createdClients1 = [];
  for (const clientData of clients1) {
    const client = await prisma.client.create({
      data: clientData,
    });
    createdClients1.push(client);
  }
  console.log('✅ Clients 1 created:', createdClients1.length);

  // Create properties for agency 1
  const properties1 = [
    {
      title: 'Appartement 3 pièces centre-ville',
      description: 'Bel appartement lumineux avec balcon, proche des transports.',
      type: 'APARTMENT' as const,
      status: 'AVAILABLE' as const,
      address: '15 Rue du Commerce',
      city: 'Paris',
      postalCode: '75015',
      price: 450000,
      surface: 75,
      rooms: 3,
      bedrooms: 2,
      bathrooms: 1,
      floor: 4,
      hasElevator: true,
      hasParking: false,
      hasBalcony: true,
      yearBuilt: 2010,
      energyClass: 'B',
      reference: 'PROP-000001',
      userId: admin1.id,
      agencyId: agency1.id,
      clientId: createdClients1[1].id,
    },
    {
      title: 'Maison avec jardin',
      description: 'Charmante maison familiale avec jardin et garage.',
      type: 'HOUSE' as const,
      status: 'AVAILABLE' as const,
      address: '42 Chemin des Vignes',
      city: 'Versailles',
      postalCode: '78000',
      price: 580000,
      surface: 120,
      rooms: 5,
      bedrooms: 4,
      bathrooms: 2,
      hasParking: true,
      hasGarden: true,
      yearBuilt: 2005,
      energyClass: 'C',
      reference: 'PROP-000002',
      userId: createdAgents1[0].id,
      agencyId: agency1.id,
      clientId: createdClients1[1].id,
    },
    {
      title: 'Studio étudiant',
      description: 'Studio meublé proche université, idéal étudiant.',
      type: 'STUDIO' as const,
      status: 'RENTED' as const,
      address: '8 Rue des Écoles',
      city: 'Paris',
      postalCode: '75005',
      price: 850,
      surface: 25,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      yearBuilt: 2015,
      energyClass: 'A',
      reference: 'PROP-000003',
      userId: createdAgents1[1].id,
      agencyId: agency1.id,
      clientId: createdClients1[3].id,
    },
    {
      title: 'Local commercial',
      description: 'Local commercial en rez-de-chaussée, vitrine sur rue.',
      type: 'COMMERCIAL' as const,
      status: 'AVAILABLE' as const,
      address: '89 Boulevard Haussmann',
      city: 'Paris',
      postalCode: '75008',
      price: 320000,
      surface: 45,
      yearBuilt: 1990,
      energyClass: 'D',
      reference: 'PROP-000004',
      userId: createdAgents1[2].id,
      agencyId: agency1.id,
    },
    {
      title: 'Appartement 2 pièces',
      description: 'Appartement rénové avec vue sur la Seine.',
      type: 'APARTMENT' as const,
      status: 'SOLD' as const,
      address: '22 Quai de la Tournelle',
      city: 'Paris',
      postalCode: '75005',
      price: 520000,
      surface: 55,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      floor: 3,
      hasElevator: true,
      yearBuilt: 2018,
      energyClass: 'A',
      reference: 'PROP-000005',
      userId: createdAgents1[3].id,
      agencyId: agency1.id,
      clientId: createdClients1[0].id,
    },
  ];

  const createdProperties1 = [];
  for (const propData of properties1) {
    const property = await prisma.property.create({
      data: propData,
    });
    createdProperties1.push(property);
  }
  console.log('✅ Properties 1 created:', createdProperties1.length);

  // Create contracts for agency 1
  const contracts1 = [
    {
      contractNumber: 'CTR-000001',
      type: 'SALE' as const,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      price: 450000,
      commission: 13500,
      commissionRate: 3,
      status: 'ACTIVE',
      userId: admin1.id,
      propertyId: createdProperties1[0].id,
      clientId: createdClients1[0].id,
      agencyId: agency1.id,
      signedDate: new Date('2024-01-10'),
    },
    {
      contractNumber: 'CTR-000002',
      type: 'RENTAL' as const,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      price: 850,
      commission: 850,
      commissionRate: 1,
      status: 'ACTIVE',
      userId: createdAgents1[1].id,
      propertyId: createdProperties1[2].id,
      clientId: createdClients1[3].id,
      agencyId: agency1.id,
      signedDate: new Date('2024-01-25'),
    },
    {
      contractNumber: 'CTR-000003',
      type: 'SALE' as const,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-01-31'),
      price: 520000,
      commission: 15600,
      commissionRate: 3,
      status: 'COMPLETED',
      userId: createdAgents1[3].id,
      propertyId: createdProperties1[4].id,
      clientId: createdClients1[0].id,
      agencyId: agency1.id,
      signedDate: new Date('2023-10-28'),
    },
  ];

  const createdContracts1 = [];
  for (const contractData of contracts1) {
    const contract = await prisma.contract.create({
      data: contractData,
    });
    createdContracts1.push(contract);
  }
  console.log('✅ Contracts 1 created:', createdContracts1.length);

  // Create appointments for agency 1
  const now = new Date();
  const appointments1 = [
    {
      title: 'Visite appartement 3 pièces',
      description: 'Visite avec M. Moreau',
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: createdProperties1[0].address,
      status: 'SCHEDULED',
      userId: admin1.id,
      agencyId: agency1.id,
      clientId: createdClients1[0].id,
      propertyId: createdProperties1[0].id,
    },
    {
      title: 'Signature contrat vente',
      description: 'Signature du contrat avec M. Moreau',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      location: agency1.address || 'Agence',
      status: 'CONFIRMED',
      userId: admin1.id,
      agencyId: agency1.id,
      clientId: createdClients1[0].id,
      propertyId: createdProperties1[0].id,
    },
    {
      title: 'Visite maison',
      description: 'Première visite avec M. Garcia',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      location: createdProperties1[1].address,
      status: 'SCHEDULED',
      userId: createdAgents1[0].id,
      agencyId: agency1.id,
      clientId: createdClients1[2].id,
      propertyId: createdProperties1[1].id,
    },
    {
      title: 'Réunion client',
      description: 'Discussion projet immobilier',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: agency1.address || 'Agence',
      status: 'SCHEDULED',
      userId: createdAgents1[2].id,
      agencyId: agency1.id,
      clientId: createdClients1[4].id,
    },
  ];

  const createdAppointments1 = [];
  for (const apptData of appointments1) {
    const appointment = await prisma.appointment.create({
      data: apptData,
    });
    createdAppointments1.push(appointment);
  }
  console.log('✅ Appointments 1 created:', createdAppointments1.length);

  // ========== AGENCE 2 ==========
  const agency2 = await prisma.agency.upsert({
    where: { code: '7890' },
    update: {},
    create: {
      code: '7890',
      name: 'Immobilier Premium',
      email: 'contact@premium-immo.fr',
      phone: '+33 4 91 23 45 67',
      address: '67 Cours Mirabeau',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      country: 'France',
      website: 'https://premium-immo.fr',
      isActive: true,
    },
  });

  console.log('✅ Agency 2 created:', agency2.name, '(Code:', agency2.code + ')');

  // Create admin user (gérant) for agency 2
  const admin2 = await prisma.user.create({
    data: {
      email: 'directeur@premium-immo.fr',
      password: hashedPassword,
      firstName: 'Laurent',
      lastName: 'Fabre',
      role: 'ADMIN',
      agencyId: agency2.id,
      phone: '+33 6 98 76 54 32',
    },
  });

  console.log('✅ Admin 2 created:', admin2.email);

  // Create 4 agents for agency 2
  const agents2 = [
    {
      email: 'claire.durand@premium-immo.fr',
      firstName: 'Claire',
      lastName: 'Durand',
      phone: '+33 6 87 65 43 21',
    },
    {
      email: 'nicolas.roux@premium-immo.fr',
      firstName: 'Nicolas',
      lastName: 'Roux',
      phone: '+33 6 76 54 32 10',
    },
    {
      email: 'emilie.blanc@premium-immo.fr',
      firstName: 'Emilie',
      lastName: 'Blanc',
      phone: '+33 6 65 43 21 09',
    },
    {
      email: 'fabien.noir@premium-immo.fr',
      firstName: 'Fabien',
      lastName: 'Noir',
      phone: '+33 6 54 32 10 98',
    },
  ];

  const createdAgents2 = [];
  for (const agentData of agents2) {
    const agent = await prisma.user.create({
      data: {
        email: agentData.email,
        password: hashedPasswordAgent,
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        phone: agentData.phone,
        role: 'AGENT',
        agencyId: agency2.id,
      },
    });
    createdAgents2.push(agent);
    console.log('✅ Agent 2 created:', agent.email);
  }

  // Create clients for agency 2
  const clients2 = [
    {
      firstName: 'Valérie',
      lastName: 'Simon',
      email: 'valerie.simon@email.com',
      phone: '+33 6 99 88 77 66',
      address: '234 Avenue du Prado',
      city: 'Marseille',
      postalCode: '13008',
      clientType: 'BUYER' as const,
      userId: admin2.id,
      agencyId: agency2.id,
    },
    {
      firstName: 'Philippe',
      lastName: 'Laurent',
      email: 'philippe.laurent@email.com',
      phone: '+33 6 88 77 66 55',
      address: '78 Rue Paradis',
      city: 'Marseille',
      postalCode: '13006',
      clientType: 'SELLER' as const,
      userId: createdAgents2[0].id,
      agencyId: agency2.id,
    },
    {
      firstName: 'Nathalie',
      lastName: 'Fournier',
      email: 'nathalie.fournier@email.com',
      phone: '+33 6 77 66 55 44',
      address: '12 Boulevard Longchamp',
      city: 'Marseille',
      postalCode: '13001',
      clientType: 'TENANT' as const,
      userId: createdAgents2[1].id,
      agencyId: agency2.id,
    },
    {
      firstName: 'Julien',
      lastName: 'Girard',
      email: 'julien.girard@email.com',
      phone: '+33 6 66 55 44 33',
      address: '45 Rue de la Rotonde',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      clientType: 'BUYER' as const,
      userId: createdAgents2[2].id,
      agencyId: agency2.id,
    },
    {
      firstName: 'Sandrine',
      lastName: 'Lopez',
      email: 'sandrine.lopez@email.com',
      phone: '+33 6 55 44 33 22',
      address: '89 Avenue Victor Hugo',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      clientType: 'LANDLORD' as const,
      userId: createdAgents2[3].id,
      agencyId: agency2.id,
    },
  ];

  const createdClients2 = [];
  for (const clientData of clients2) {
    const client = await prisma.client.create({
      data: clientData,
    });
    createdClients2.push(client);
  }
  console.log('✅ Clients 2 created:', createdClients2.length);

  // Create properties for agency 2
  const properties2 = [
    {
      title: 'Villa provençale avec piscine',
      description: 'Magnifique villa rénovée avec piscine, jardin paysager et terrasse.',
      type: 'VILLA' as const,
      status: 'AVAILABLE' as const,
      address: '156 Chemin de la Vallée',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      price: 850000,
      surface: 180,
      rooms: 6,
      bedrooms: 4,
      bathrooms: 3,
      hasParking: true,
      hasGarden: true,
      hasBalcony: true,
      yearBuilt: 2015,
      energyClass: 'B',
      reference: 'PROP-000006',
      userId: admin2.id,
      agencyId: agency2.id,
      clientId: createdClients2[1].id,
    },
    {
      title: 'Duplex moderne centre-ville',
      description: 'Duplex récent avec terrasse, vue panoramique.',
      type: 'APARTMENT' as const,
      status: 'AVAILABLE' as const,
      address: '34 Rue des Tonnelles',
      city: 'Marseille',
      postalCode: '13006',
      price: 680000,
      surface: 95,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      floor: 5,
      hasElevator: true,
      hasParking: true,
      hasBalcony: true,
      yearBuilt: 2020,
      energyClass: 'A',
      reference: 'PROP-000007',
      userId: createdAgents2[0].id,
      agencyId: agency2.id,
      clientId: createdClients2[1].id,
    },
    {
      title: 'Appartement T2 proche plage',
      description: 'Appartement avec vue mer, proche des plages et commerces.',
      type: 'APARTMENT' as const,
      status: 'RENTED' as const,
      address: '12 Promenade de la Plage',
      city: 'Marseille',
      postalCode: '13008',
      price: 1200,
      surface: 48,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      hasBalcony: true,
      yearBuilt: 2012,
      energyClass: 'B',
      reference: 'PROP-000008',
      userId: createdAgents2[1].id,
      agencyId: agency2.id,
      clientId: createdClients2[2].id,
    },
    {
      title: 'Bureau professionnel',
      description: 'Bureau moderne dans immeuble d\'affaires, climatisé.',
      type: 'OFFICE' as const,
      status: 'AVAILABLE' as const,
      address: '56 Avenue des Arts',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      price: 180000,
      surface: 65,
      yearBuilt: 2008,
      energyClass: 'C',
      reference: 'PROP-000009',
      userId: createdAgents2[2].id,
      agencyId: agency2.id,
    },
    {
      title: 'Terrain constructible',
      description: 'Terrain viabilisé, constructible, vue dégagée.',
      type: 'LAND' as const,
      status: 'AVAILABLE' as const,
      address: 'Lieu-dit Les Oliviers',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      price: 125000,
      surface: 500,
      reference: 'PROP-000010',
      userId: createdAgents2[3].id,
      agencyId: agency2.id,
    },
  ];

  const createdProperties2 = [];
  for (const propData of properties2) {
    const property = await prisma.property.create({
      data: propData,
    });
    createdProperties2.push(property);
  }
  console.log('✅ Properties 2 created:', createdProperties2.length);

  // Create contracts for agency 2
  const contracts2 = [
    {
      contractNumber: 'CTR-000004',
      type: 'SALE' as const,
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-05-10'),
      price: 850000,
      commission: 25500,
      commissionRate: 3,
      status: 'ACTIVE',
      userId: admin2.id,
      propertyId: createdProperties2[0].id,
      clientId: createdClients2[0].id,
      agencyId: agency2.id,
      signedDate: new Date('2024-02-05'),
    },
    {
      contractNumber: 'CTR-000005',
      type: 'RENTAL' as const,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      price: 1200,
      commission: 1200,
      commissionRate: 1,
      status: 'ACTIVE',
      userId: createdAgents2[1].id,
      propertyId: createdProperties2[2].id,
      clientId: createdClients2[2].id,
      agencyId: agency2.id,
      signedDate: new Date('2024-01-10'),
    },
    {
      contractNumber: 'CTR-000006',
      type: 'SALE' as const,
      startDate: new Date('2023-12-01'),
      endDate: new Date('2024-02-29'),
      price: 680000,
      commission: 20400,
      commissionRate: 3,
      status: 'COMPLETED',
      userId: createdAgents2[0].id,
      propertyId: createdProperties2[1].id,
      clientId: createdClients2[3].id,
      agencyId: agency2.id,
      signedDate: new Date('2023-11-25'),
    },
  ];

  const createdContracts2 = [];
  for (const contractData of contracts2) {
    const contract = await prisma.contract.create({
      data: contractData,
    });
    createdContracts2.push(contract);
  }
  console.log('✅ Contracts 2 created:', createdContracts2.length);

  // Create appointments for agency 2
  const appointments2 = [
    {
      title: 'Visite villa avec piscine',
      description: 'Visite complète avec M. Simon',
      startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      location: createdProperties2[0].address,
      status: 'CONFIRMED',
      userId: admin2.id,
      agencyId: agency2.id,
      clientId: createdClients2[0].id,
      propertyId: createdProperties2[0].id,
    },
    {
      title: 'Expertise appartement',
      description: 'Expertise pour estimation',
      startDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
      location: createdProperties2[1].address,
      status: 'SCHEDULED',
      userId: createdAgents2[0].id,
      agencyId: agency2.id,
      clientId: createdClients2[1].id,
      propertyId: createdProperties2[1].id,
    },
    {
      title: 'Signature bail location',
      description: 'Signature du contrat de location',
      startDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      location: agency2.address || 'Agence',
      status: 'SCHEDULED',
      userId: createdAgents2[2].id,
      agencyId: agency2.id,
      clientId: createdClients2[4].id,
    },
    {
      title: 'Visite terrain',
      description: 'Visite du terrain avec M. Girard',
      startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: createdProperties2[4].address,
      status: 'SCHEDULED',
      userId: createdAgents2[3].id,
      agencyId: agency2.id,
      clientId: createdClients2[3].id,
      propertyId: createdProperties2[4].id,
    },
  ];

  const createdAppointments2 = [];
  for (const apptData of appointments2) {
    const appointment = await prisma.appointment.create({
      data: apptData,
    });
    createdAppointments2.push(appointment);
  }
  console.log('✅ Appointments 2 created:', createdAppointments2.length);

  console.log('\n✨ Seeding completed!');
  console.log('\n📝 Login credentials:');
  console.log('\n   Super Admin (pour créer des agences):');
  console.log('   Email: superadmin@crm.local');
  console.log('   Password: admin123');
  
  console.log('\n   === AGENCE 1 (Code: ' + agency1.code + ') ===');
  console.log('   Gérant:');
  console.log('   Email: admin@example.com / Password: admin123');
  console.log('   Collaborateurs:');
  console.log('   Email: marie.martin@example.com / Password: agent123');
  console.log('   Email: jean.dupont@example.com / Password: agent123');
  console.log('   Email: sophie.bernard@example.com / Password: agent123');
  console.log('   Email: thomas.leroy@example.com / Password: agent123');

  console.log('\n   === AGENCE 2 (Code: ' + agency2.code + ') ===');
  console.log('   Gérant:');
  console.log('   Email: directeur@premium-immo.fr / Password: admin123');
  console.log('   Collaborateurs:');
  console.log('   Email: claire.durand@premium-immo.fr / Password: agent123');
  console.log('   Email: nicolas.roux@premium-immo.fr / Password: agent123');
  console.log('   Email: emilie.blanc@premium-immo.fr / Password: agent123');
  console.log('   Email: fabien.noir@premium-immo.fr / Password: agent123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
