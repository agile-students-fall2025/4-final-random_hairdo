import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../db.js'
import { User, Facility, Zone, Queue, Goal, History, Notification, FAQ, SupportIssue } from '../db.js'
import {
  users,
  facilities,
  zones,
  queues,
  goals,
  history,
  notifications,
  faqs,
  supportIssues
} from '../utils/mockData.js'

dotenv.config()

async function clearCollections() {
  console.log('Clearing existing collections...')
  await Promise.all([
    User.deleteMany({}),
    Facility.deleteMany({}),
    Zone.deleteMany({}),
    Queue.deleteMany({}),
    Goal.deleteMany({}),
    History.deleteMany({}),
    Notification.deleteMany({}),
    FAQ.deleteMany({}),
    SupportIssue.deleteMany({})
  ])
  console.log('Collections cleared!')
}

async function seedDatabase() {
  try {
    await connectDB()

    // Clear existing data
    await clearCollections()

    // Maps from mock numeric IDs to MongoDB ObjectIds
    const userIdMap = new Map()
    const facilityIdMap = new Map()
    const zoneIdMap = new Map()
    const queueIdMap = new Map()
    const goalIdMap = new Map()

    // Insert Users
    console.log('Seeding users...')
    for (const u of users) {
      const doc = new User({
        name: u.name,
        email: u.email,
        password: u.password,
        goals: u.goals,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt)
      })
      await doc.save()
      userIdMap.set(u.id, doc._id)
    }
    console.log(`${users.length} users created`)

    // Insert Facilities
    console.log('Seeding facilities...')
    for (const f of facilities) {
      const doc = new Facility({
        name: f.name,
        address: f.address,
        capacity: f.capacity,
        hours: f.hours,
        amenities: f.amenities,
        phone: f.phone,
        createdAt: new Date(f.createdAt)
      })
      await doc.save()
      facilityIdMap.set(f.id, doc._id)
    }
    console.log(`${facilities.length} facilities created`)

    // Insert Zones (with facility references)
    console.log('Seeding zones...')
    for (const z of zones) {
      const doc = new Zone({
        facilityId: facilityIdMap.get(z.facilityId),
        name: z.name,
        equipment: z.equipment,
        capacity: z.capacity,
        currentOccupancy: z.currentOccupancy,
        queueLength: z.queueLength,
        averageWaitTime: z.averageWaitTime,
        status: z.status,
        createdAt: new Date(z.createdAt)
      })
      await doc.save()
      zoneIdMap.set(z.id, doc._id)
    }
    console.log(`${zones.length} zones created`)

    // Insert Goals (with user references)
    console.log('Seeding goals...')
    for (const g of goals) {
      const doc = new Goal({
        userId: userIdMap.get(g.userId),
        goal: g.goal,
        progress: g.progress,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt)
      })
      await doc.save()
      goalIdMap.set(g.id, doc._id)
    }
    console.log(`${goals.length} goals created`)

    // Insert History (with user, facility, zone references)
    console.log('Seeding history...')
    for (const h of history) {
      const doc = new History({
        userId: userIdMap.get(h.userId),
        facilityId: facilityIdMap.get(h.facilityId),
        zoneId: zoneIdMap.get(h.zoneId),
        zoneName: h.zoneName,
        exercises: h.exercises,
        date: new Date(h.date),
        duration: h.duration,
        type: h.type,
        notes: h.notes,
        caloriesBurned: h.caloriesBurned,
        createdAt: new Date(h.createdAt)
      })
      await doc.save()
    }
    console.log(`${history.length} history records created`)

    // Insert Queues (with user, zone, facility references)
    console.log('Seeding queues...')
    for (const q of queues) {
      const doc = new Queue({
        userId: userIdMap.get(q.userId),
        zoneId: zoneIdMap.get(q.zoneId),
        facilityId: facilityIdMap.get(q.facilityId),
        position: q.position,
        estimatedWait: q.estimatedWait,
        status: q.status,
        joinedAt: new Date(q.joinedAt),
        completedAt: q.completedAt ? new Date(q.completedAt) : null
      })
      await doc.save()
      queueIdMap.set(q.id, doc._id)
    }
    console.log(`${queues.length} queue records created`)

    // Insert Notifications (with user references)
    console.log('Seeding notifications...')
    for (const n of notifications) {
      // Map relatedId based on relatedType
      let mappedRelatedId = null
      if (n.relatedId) {
        switch (n.relatedType) {
          case 'queue':
            mappedRelatedId = queueIdMap.get(n.relatedId)
            break
          case 'goal':
            mappedRelatedId = goalIdMap.get(n.relatedId)
            break
          case 'facility':
            mappedRelatedId = facilityIdMap.get(n.relatedId)
            break
          case 'zone':
            mappedRelatedId = zoneIdMap.get(n.relatedId)
            break
          default:
            console.warn(`Unknown relatedType: ${n.relatedType} for notification ${n.id}`)
        }
      }

      const doc = new Notification({
        userId: userIdMap.get(n.userId),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        priority: n.priority,
        relatedId: mappedRelatedId,
        relatedType: n.relatedType,
        createdAt: new Date(n.createdAt)
      })
      await doc.save()
    }
    console.log(`${notifications.length} notifications created`)

    // Insert FAQs
    console.log('Seeding FAQs...')
    for (const f of faqs) {
      const doc = new FAQ({
        category: f.category,
        question: f.question,
        answer: f.answer,
        order: f.order
      })
      await doc.save()
    }
    console.log(`${faqs.length} FAQs created`)

    // Insert Support Issues (with user references)
    console.log('Seeding support issues...')
    for (const s of supportIssues) {
      const doc = new SupportIssue({
        userId: userIdMap.get(s.userId),
        subject: s.subject,
        description: s.description,
        category: s.category,
        status: s.status,
        priority: s.priority,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        resolvedAt: s.resolvedAt ? new Date(s.resolvedAt) : null
      })
      await doc.save()
    }
    console.log(`${supportIssues.length} support issues created`)

    console.log('\nDatabase seeding completed successfully!')
    console.log('\nCreated user accounts:')
    users.forEach(u => {
      console.log(`  - ${u.email} (password: see mockData.js)`)
    })

  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\nDatabase connection closed.')
  }
}

seedDatabase()
