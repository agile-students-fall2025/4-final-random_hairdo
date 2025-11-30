import mongoose from 'mongoose'

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  goals: [{
    type: String
  }]
}, {
  timestamps: true
})

// Facility Schema
const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  hours: {
    weekdays: String,
    weekends: String
  },
  amenities: [{
    type: String
  }],
  phone: {
    type: String
  }
}, {
  timestamps: true
})

// Zone Schema
const zoneSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  equipment: [{
    type: String
  }],
  capacity: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  queueLength: {
    type: Number,
    default: 0
  },
  averageWaitTime: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['available', 'moderate', 'busy'],
    default: 'available'
  }
}, {
  timestamps: true
})

// Queue Schema
const queueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  estimatedWait: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Goal Schema
const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  currentValue: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'abandoned'],
    default: 'not-started'
  }
}, {
  timestamps: true
})

// History Schema
const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  zoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',
    required: true
  },
  zoneName: {
    type: String,
    required: true
  },
  exercises: [{
    type: String
  }],
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  caloriesBurned: {
    type: Number
  }
}, {
  timestamps: true
})

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['queue_update', 'queue_ready', 'goal_progress', 'reminder', 'facility_alert', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    enum: ['queue', 'goal', 'facility', 'zone']
  }
}, {
  timestamps: true
})

// FAQ Schema
const faqSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Support Issue Schema
const supportIssueSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical', 'Queue', 'Account', 'Feature Request', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Create models
export const User = mongoose.model('User', userSchema)
export const Facility = mongoose.model('Facility', facilitySchema)
export const Zone = mongoose.model('Zone', zoneSchema)
export const Queue = mongoose.model('Queue', queueSchema)
export const Goal = mongoose.model('Goal', goalSchema)
export const History = mongoose.model('History', historySchema)
export const Notification = mongoose.model('Notification', notificationSchema)
export const FAQ = mongoose.model('FAQ', faqSchema)
export const SupportIssue = mongoose.model('SupportIssue', supportIssueSchema)

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
