const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { processMatchesForItem } = require('../services/matchingEngine');

async function seed() {
  console.log('🌱 Starting FindIt seed script...');
  await connectDB();

  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Claim.deleteMany({}),
    Match.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log('👤 Seeding campus users...');
  const users = await User.create([
    {
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      password: 'AdminPass123!',
      role: 'admin',
      department: 'Campus Security & Student Affairs',
      studentId: 'STAFF-ADM-01'
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      password: 'StudentPass123!',
      role: 'user',
      department: 'Computer Science & Engineering',
      studentId: 'CS-2024-042'
    },
    {
      name: 'Riya Patel',
      email: 'riya.patel@campus.edu',
      password: 'StudentPass123!',
      role: 'user',
      department: 'Electrical Engineering',
      studentId: 'EE-2024-118'
    },
    {
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@campus.edu',
      password: 'StudentPass123!',
      role: 'user',
      department: 'Mechanical Engineering',
      studentId: 'ME-2023-089'
    }
  ]);

  const [admin, aarav, riya, ananya] = users;

  console.log('📦 Seeding sample items...');
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const itemsData = [
    // High similarity match pair 1 (Earbuds)
    {
      reporter: aarav._id,
      type: 'lost',
      title: 'Black BoAt Airdopes Wireless Earbuds',
      category: 'Electronics',
      description: 'Lost my black wireless earbuds inside their charging case. Has a small tiny white dot sticker on the hinge. Left them while studying for Mid-sem exams.',
      color: 'Black',
      campusZone: 'Central Library',
      approximateLocation: '2nd Floor Silent Study Section, Table 14 near the corner window',
      date: new Date(now.getTime() - 2 * day),
      status: 'pending',
      tags: ['audio', 'bluetooth', 'earbuds']
    },
    {
      reporter: riya._id,
      type: 'found',
      title: 'Black Wireless Earphones with Case',
      category: 'Electronics',
      description: 'Found black true wireless earbuds in a matte black capsule charging case on one of the library desks. Handed over to safe keeping until verified owner claims.',
      color: 'Black',
      campusZone: 'Central Library',
      approximateLocation: 'Library 2nd floor reading hall near the Computer Science shelf',
      date: new Date(now.getTime() - 1 * day),
      status: 'pending',
      tags: ['electronics', 'earphones', 'library']
    },

    // Possible match pair 2 (Water Bottle)
    {
      reporter: riya._id,
      type: 'lost',
      title: 'Blue Milton Steel Water Bottle',
      category: 'Bottles & Containers',
      description: 'Blue insulated stainless steel flask with black screw cap and small dent on bottom rim.',
      color: 'Blue',
      campusZone: 'Cafeteria & Food Court',
      approximateLocation: 'Corner booth table near fresh juice counter',
      date: new Date(now.getTime() - 3 * day),
      status: 'open',
      tags: ['bottle', 'flask', 'hydration']
    },
    {
      reporter: ananya._id,
      type: 'found',
      title: 'Dark Blue Metal Flask / Sipper',
      category: 'Bottles & Containers',
      description: 'Found a dark blue metallic insulated bottle left behind on the stone benches outside hall 101.',
      color: 'Navy',
      campusZone: 'Main Academic Complex',
      approximateLocation: 'Ground floor stone benches outside Lecture Hall 101',
      date: new Date(now.getTime() - 2 * day),
      status: 'open',
      tags: ['bottle', 'metal', 'academic-block']
    },

    // High similarity match pair 3 (Student ID card)
    {
      reporter: ananya._id,
      type: 'lost',
      title: 'College Student ID Card & Ribbon Lanyard',
      category: 'Documents & IDs',
      description: 'Lost my official student ID card with blue university lanyard and magnetic swipe pass.',
      color: 'Blue',
      campusZone: 'Main Academic Complex',
      approximateLocation: 'Classroom corridor outside Room 204',
      date: new Date(now.getTime() - 4 * day),
      status: 'open',
      tags: ['id-card', 'lanyard', 'student']
    },
    {
      reporter: aarav._id,
      type: 'found',
      title: 'Student Identity Card with Blue Lanyard',
      category: 'Documents & IDs',
      description: 'Found an official university student identity card dropped on the staircase. Photo and details are safely kept at Security Desk for verification.',
      color: 'Blue',
      campusZone: 'Main Academic Complex',
      approximateLocation: 'Central staircase between 1st and 2nd floor',
      date: new Date(now.getTime() - 3 * day),
      status: 'open',
      tags: ['identity', 'id', 'found-card']
    },

    // Standalone item 4 (Calculator)
    {
      reporter: aarav._id,
      type: 'lost',
      title: 'Casio FX-991EX Classwiz Calculator',
      category: 'Electronics',
      description: 'Scientific calculator with black protective sliding cover. Has formula cheat sheet stuck inside the slide cover.',
      color: 'Black',
      campusZone: 'Engineering Labs',
      approximateLocation: 'Circuit Analysis Laboratory bench 4',
      date: new Date(now.getTime() - 5 * day),
      status: 'open',
      tags: ['calculator', 'casio', 'engineering']
    },

    // Standalone item 5 (Gym Keys)
    {
      reporter: ananya._id,
      type: 'found',
      title: 'Ring of 3 Keys with Batman Logo Keychain',
      category: 'Keys',
      description: 'Set of two brass cupboard keys and one bike key on a round silver ring with a black rubber Batman keychain.',
      color: 'Silver',
      campusZone: 'Sports Complex & Gym',
      approximateLocation: 'Badminton court spectator seating row 2',
      date: new Date(now.getTime() - 1 * day),
      status: 'open',
      tags: ['keys', 'keychain', 'gym']
    }
  ];

  const createdItems = [];
  for (const itemData of itemsData) {
    const qrPayload = JSON.stringify({
      app: 'FindIt-Campus',
      title: itemData.title,
      type: itemData.type,
      campusZone: itemData.campusZone
    });
    const qrCode = await QRCode.toDataURL(qrPayload).catch(() => '');

    const item = await Item.create({
      ...itemData,
      qrCode,
      images: []
    });
    createdItems.push(item);
  }

  console.log(`✨ Created ${createdItems.length} items. Calculating intelligent similarity matches...`);

  // Run matching engine for all items
  for (const item of createdItems) {
    await processMatchesForItem(item);
  }

  // Find the earbuds found item to attach a sample claim
  const foundEarbuds = createdItems.find((i) => i.title.includes('Wireless Earphones'));
  if (foundEarbuds) {
    console.log('📝 Seeding sample ownership claim...');
    const sampleClaim = await Claim.create({
      item: foundEarbuds._id,
      claimant: aarav._id,
      status: 'pending',
      verificationAnswers: {
        distinguishingMarks: 'Tiny circular white sticker on case hinge and a minor hairline scratch near the left earbud stem charging contact.',
        contentsOrDetails: 'Black silicone tips in medium size; paired Bluetooth device name is "Aarav-Airdopes".',
        additionalProof: 'Original invoice from Amazon India dated August 2024 available.'
      }
    });

    await Notification.create({
      recipient: riya._id,
      type: 'claim_submitted',
      title: 'New Ownership Claim Submitted',
      message: `Aarav Sharma submitted an ownership claim for your found item "${foundEarbuds.title}". It is awaiting admin verification.`,
      item: foundEarbuds._id,
      claim: sampleClaim._id
    });
  }

  // Seed sample admin audit log
  await AuditLog.create({
    admin: admin._id,
    action: 'SYSTEM_INITIALIZATION',
    targetResource: {
      resourceType: 'Item',
      resourceId: createdItems[0]._id
    },
    details: {
      message: 'Demo dataset initialized with 4 campus users and 8 lost/found items.'
    },
    ipAddress: '127.0.0.1'
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials for Instant Testing:');
  console.log('👑 Admin:    admin@campus.edu     / AdminPass123!');
  console.log('🎓 Student 1: aarav.sharma@campus.edu / StudentPass123!');
  console.log('🎓 Student 2: riya.patel@campus.edu   / StudentPass123!');
  console.log('🎓 Student 3: ananya.deshmukh@campus.edu / StudentPass123!');
  console.log('--------------------------------------------------\n');

  await disconnectDB();
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}

module.exports = seed;
