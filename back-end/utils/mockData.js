export const users = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2b$10$YourHashedPasswordHere', // In real app, this would be hashed
    goals: ['Weight Loss', 'Muscle Gain'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2b$10$AnotherHashedPassword',
    goals: ['Cardio Fitness', 'Flexibility'],
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: '$2b$10$YetAnotherHashedPassword',
    goals: ['Strength Training'],
    createdAt: '2024-03-10T08:15:00Z',
    updatedAt: '2024-03-10T08:15:00Z'
  }
]

export const facilities = [
  {
    id: 1,
    name: 'Downtown Fitness Center',
    address: '123 Main Street, New York, NY 10001',
    capacity: 200,
    hours: {
      weekdays: '5:00 AM - 11:00 PM',
      weekends: '7:00 AM - 9:00 PM'
    },
    amenities: ['Lockers', 'Showers', 'Parking', 'WiFi'],
    phone: '(555) 123-4567',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Uptown Wellness Gym',
    address: '456 Park Avenue, New York, NY 10022',
    capacity: 150,
    hours: {
      weekdays: '6:00 AM - 10:00 PM',
      weekends: '8:00 AM - 8:00 PM'
    },
    amenities: ['Lockers', 'Showers', 'Sauna', 'Pool'],
    phone: '(555) 234-5678',
    createdAt: '2023-02-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Brooklyn Athletic Club',
    address: '789 Bedford Ave, Brooklyn, NY 11211',
    capacity: 180,
    hours: {
      weekdays: '5:30 AM - 11:30 PM',
      weekends: '7:00 AM - 10:00 PM'
    },
    amenities: ['Lockers', 'Showers', 'Parking', 'Cafe'],
    phone: '(555) 345-6789',
    createdAt: '2023-03-01T00:00:00Z'
  }
]

export const zones = [
  {
    id: 1,
    facilityId: 1,
    name: 'Cardio Zone',
    equipment: ['Treadmills', 'Ellipticals', 'Bikes'],
    capacity: 30,
    currentOccupancy: 22,
    queueLength: 5,
    averageWaitTime: 15, // minutes
    status: 'busy',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 2,
    facilityId: 1,
    name: 'Weight Training Zone',
    equipment: ['Dumbbells', 'Barbells', 'Bench Press'],
    capacity: 25,
    currentOccupancy: 18,
    queueLength: 3,
    averageWaitTime: 20,
    status: 'moderate',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    facilityId: 1,
    name: 'Functional Training Zone',
    equipment: ['Kettlebells', 'Battle Ropes', 'TRX'],
    capacity: 20,
    currentOccupancy: 8,
    queueLength: 0,
    averageWaitTime: 0,
    status: 'available',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: 4,
    facilityId: 2,
    name: 'Cardio Zone',
    equipment: ['Treadmills', 'Stair Masters', 'Rowing Machines'],
    capacity: 25,
    currentOccupancy: 20,
    queueLength: 4,
    averageWaitTime: 12,
    status: 'busy',
    createdAt: '2023-02-01T00:00:00Z'
  },
  {
    id: 5,
    facilityId: 2,
    name: 'Strength Training Zone',
    equipment: ['Cable Machines', 'Smith Machine', 'Leg Press'],
    capacity: 20,
    currentOccupancy: 10,
    queueLength: 1,
    averageWaitTime: 10,
    status: 'available',
    createdAt: '2023-02-01T00:00:00Z'
  },
  {
    id: 6,
    facilityId: 3,
    name: 'CrossFit Zone',
    equipment: ['Pull-up Bars', 'Olympic Platforms', 'Plyometric Boxes'],
    capacity: 15,
    currentOccupancy: 14,
    queueLength: 6,
    averageWaitTime: 25,
    status: 'busy',
    createdAt: '2023-03-01T00:00:00Z'
  }
]

export const queues = [
  {
    id: 1,
    userId: 1,
    zoneId: 1,
    facilityId: 1,
    position: 1,
    estimatedWait: 10, // minutes
    status: 'active',
    joinedAt: '2024-11-11T09:00:00Z',
    updatedAt: '2024-11-11T09:00:00Z',
    completedAt: null
  },
  {
    id: 2,
    userId: 2,
    zoneId: 1,
    facilityId: 1,
    position: 2,
    estimatedWait: 20,
    status: 'active',
    joinedAt: '2024-11-11T09:05:00Z',
    updatedAt: '2024-11-11T09:05:00Z',
    completedAt: null
  },
  {
    id: 3,
    userId: 3,
    zoneId: 2,
    facilityId: 1,
    position: 1,
    estimatedWait: 15,
    status: 'active',
    joinedAt: '2024-11-11T08:45:00Z',
    updatedAt: '2024-11-11T08:45:00Z',
    completedAt: null
  },
  {
    id: 4,
    userId: 1,
    zoneId: 2,
    facilityId: 1,
    position: 0,
    estimatedWait: 0,
    status: 'completed',
    joinedAt: '2024-11-10T15:00:00Z',
    updatedAt: '2024-11-10T15:30:00Z',
    completedAt: '2024-11-10T15:30:00Z'
  },
  {
    id: 5,
    userId: 2,
    zoneId: 4,
    facilityId: 2,
    position: 0,
    estimatedWait: 0,
    status: 'cancelled',
    joinedAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-10T10:15:00Z',
    completedAt: null
  }
]

export const goals = [
  {
    id: 1,
    userId: 1,
    title: 'Lose 10 pounds',
    description: 'Reduce body weight through cardio and diet',
    type: 'Weight Loss',
    targetValue: 10,
    currentValue: 4,
    unit: 'lbs',
    targetDate: '2024-12-31',
    status: 'in-progress',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-11T09:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    title: 'Bench Press 200 lbs',
    description: 'Increase bench press strength',
    type: 'Muscle Gain',
    targetValue: 200,
    currentValue: 165,
    unit: 'lbs',
    targetDate: '2025-03-31',
    status: 'in-progress',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-11-11T09:00:00Z'
  },
  {
    id: 3,
    userId: 2,
    title: 'Run 5K in 25 minutes',
    description: 'Improve running speed and endurance',
    type: 'Cardio Fitness',
    targetValue: 25,
    currentValue: 28,
    unit: 'minutes',
    targetDate: '2025-01-31',
    status: 'in-progress',
    createdAt: '2024-02-20T14:30:00Z',
    updatedAt: '2024-11-11T09:00:00Z'
  },
  {
    id: 4,
    userId: 3,
    title: 'Deadlift 300 lbs',
    description: 'Build overall strength',
    type: 'Strength Training',
    targetValue: 300,
    currentValue: 250,
    unit: 'lbs',
    targetDate: '2025-06-30',
    status: 'in-progress',
    createdAt: '2024-03-10T08:15:00Z',
    updatedAt: '2024-11-11T09:00:00Z'
  },
  {
    id: 5,
    userId: 2,
    title: 'Touch toes without bending knees',
    description: 'Improve flexibility',
    type: 'Flexibility',
    targetValue: 1,
    currentValue: 0,
    unit: 'achievement',
    targetDate: '2025-02-28',
    status: 'in-progress',
    createdAt: '2024-04-01T12:00:00Z',
    updatedAt: '2024-11-11T09:00:00Z'
  }
]

export const history = [
  {
    id: 1,
    userId: 1,
    facilityId: 1,
    zoneId: 1,
    zoneName: 'Cardio Zone',
    date: '2024-11-10T15:00:00Z',
    duration: 45, // minutes
    type: 'Cardio',
    notes: 'Treadmill run - felt great!',
    caloriesBurned: 350,
    createdAt: '2024-11-10T16:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    facilityId: 1,
    zoneId: 2,
    zoneName: 'Weight Training Zone',
    date: '2024-11-09T17:30:00Z',
    duration: 60,
    type: 'Strength',
    notes: 'Chest and triceps day',
    caloriesBurned: 280,
    createdAt: '2024-11-09T18:45:00Z'
  },
  {
    id: 3,
    userId: 2,
    facilityId: 2,
    zoneId: 4,
    zoneName: 'Cardio Zone',
    date: '2024-11-10T08:00:00Z',
    duration: 30,
    type: 'Cardio',
    notes: 'Morning run on treadmill',
    caloriesBurned: 280,
    createdAt: '2024-11-10T08:45:00Z'
  },
  {
    id: 4,
    userId: 3,
    facilityId: 3,
    zoneId: 6,
    zoneName: 'CrossFit Zone',
    date: '2024-11-09T19:00:00Z',
    duration: 50,
    type: 'CrossFit',
    notes: 'WOD: Fran - 21-15-9',
    caloriesBurned: 450,
    createdAt: '2024-11-09T20:00:00Z'
  },
  {
    id: 5,
    userId: 2,
    facilityId: 2,
    zoneId: 5,
    zoneName: 'Strength Training Zone',
    date: '2024-11-08T18:00:00Z',
    duration: 55,
    type: 'Strength',
    notes: 'Leg day - squats and lunges',
    caloriesBurned: 320,
    createdAt: '2024-11-08T19:00:00Z'
  },
  {
    id: 6,
    userId: 1,
    facilityId: 1,
    zoneId: 3,
    zoneName: 'Functional Training Zone',
    date: '2024-11-07T14:00:00Z',
    duration: 40,
    type: 'Functional',
    notes: 'Kettlebell workout',
    caloriesBurned: 300,
    createdAt: '2024-11-07T14:50:00Z'
  }
]

export const notifications = [
  {
    id: 1,
    userId: 1,
    type: 'queue_update',
    title: 'Queue Position Updated',
    message: 'You are now #1 in the Cardio Zone queue. Estimated wait: 5 minutes',
    isRead: false,
    priority: 'high',
    relatedId: 1, // queueId
    relatedType: 'queue',
    createdAt: '2024-11-11T09:10:00Z'
  },
  {
    id: 2,
    userId: 1,
    type: 'goal_progress',
    title: 'Goal Progress Update',
    message: 'You\'re 40% of the way to losing 10 pounds. Keep it up!',
    isRead: false,
    priority: 'medium',
    relatedId: 1, // goalId
    relatedType: 'goal',
    createdAt: '2024-11-11T08:00:00Z'
  },
  {
    id: 3,
    userId: 2,
    type: 'queue_ready',
    title: 'Your Turn!',
    message: 'The Cardio Zone is now available. Please proceed to the equipment.',
    isRead: true,
    priority: 'high',
    relatedId: 2, // queueId
    relatedType: 'queue',
    createdAt: '2024-11-10T16:00:00Z'
  },
  {
    id: 4,
    userId: 2,
    type: 'reminder',
    title: 'Workout Reminder',
    message: 'Don\'t forget your scheduled workout today at 6:00 PM',
    isRead: true,
    priority: 'low',
    relatedId: null,
    relatedType: null,
    createdAt: '2024-11-10T12:00:00Z'
  },
  {
    id: 5,
    userId: 3,
    type: 'facility_alert',
    title: 'Facility Closing Early',
    message: 'Brooklyn Athletic Club will close at 9:00 PM today due to maintenance',
    isRead: false,
    priority: 'high',
    relatedId: 3, // facilityId
    relatedType: 'facility',
    createdAt: '2024-11-11T07:00:00Z'
  },
  {
    id: 6,
    userId: 1,
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You completed 5 workouts this week. Great job!',
    isRead: true,
    priority: 'medium',
    relatedId: null,
    relatedType: null,
    createdAt: '2024-11-09T20:00:00Z'
  }
]

export const faqs = [
  {
    id: 1,
    category: 'General',
    question: 'How does the queue system work?',
    answer: 'When you join a queue for a specific equipment zone, you\'ll receive an estimated wait time and your position in line. You\'ll get notifications as your turn approaches.',
    order: 1
  },
  {
    id: 2,
    category: 'General',
    question: 'Can I join multiple queues at once?',
    answer: 'No, you can only be in one active queue at a time to ensure fair access for all members.',
    order: 2
  },
  {
    id: 3,
    category: 'Account',
    question: 'How do I change my password?',
    answer: 'Go to Settings > Change Password. You\'ll need to enter your current password and choose a new one.',
    order: 3
  },
  {
    id: 4,
    category: 'Account',
    question: 'Can I use the app at multiple facilities?',
    answer: 'Yes! Your account works at all SmartFit facilities. Just select the facility you\'re visiting when joining a queue.',
    order: 4
  },
  {
    id: 5,
    category: 'Goals',
    question: 'How do I track my fitness goals?',
    answer: 'Visit the Goals page to set and track your fitness objectives. You can add multiple goals and update your progress after each workout.',
    order: 5
  },
  {
    id: 6,
    category: 'Queues',
    question: 'What happens if I miss my turn?',
    answer: 'If you don\'t check in within 5 minutes of your turn, you\'ll be removed from the queue and will need to join again.',
    order: 6
  },
  {
    id: 7,
    category: 'Notifications',
    question: 'How do I enable push notifications?',
    answer: 'Go to Settings > Notifications to customize which notifications you receive and enable push alerts.',
    order: 7
  }
]

export const supportIssues = [
  {
    id: 1,
    userId: 1,
    subject: 'Unable to join queue',
    description: 'I keep getting an error when trying to join the Cardio Zone queue',
    category: 'Technical',
    status: 'open',
    priority: 'high',
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-10T10:00:00Z',
    resolvedAt: null
  },
  {
    id: 2,
    userId: 2,
    subject: 'Wrong wait time estimate',
    description: 'The estimated wait time was 15 minutes but I waited for 30 minutes',
    category: 'Queue',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-11-09T14:30:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
    resolvedAt: null
  },
  {
    id: 3,
    userId: 3,
    subject: 'Feature request: add yoga classes',
    description: 'Would love to see yoga class schedules and sign-ups in the app',
    category: 'Feature Request',
    status: 'closed',
    priority: 'low',
    createdAt: '2024-11-05T16:00:00Z',
    updatedAt: '2024-11-08T11:00:00Z',
    resolvedAt: '2024-11-08T11:00:00Z'
  }
]

export const getNextId = (array) => {
  if (array.length === 0) return 1
  return Math.max(...array.map(item => item.id)) + 1

}
export const findById = (array, id) => {
  return array.find(item => item.id === parseInt(id))
}

export const findByUserId = (array, userId) => {
  return array.filter(item => item.userId === parseInt(userId))
}

export const findByFacilityId = (array, facilityId) => {
  return array.filter(item => item.facilityId === parseInt(facilityId))
}

export default {
  users,
  facilities,
  zones,
  queues,
  goals,
  history,
  notifications,
  faqs,
  supportIssues,
  getNextId,
  findById,
  findByUserId,
  findByFacilityId
}
