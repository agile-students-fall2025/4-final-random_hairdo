// utils/mockData.js
// -----------------------------------------------------------
// Temporary mock data for development/testing
// -----------------------------------------------------------

export const facilities = [
  { id: 1, name: "NYU Gym", address: "726 Broadway", capacity: 50 },
  { id: 2, name: "Palladium Athletic Facility", address: "140 E 14th St", capacity: 80 }
];

export const zones = [
  { id: 1, facilityId: 1, name: "Cardio Zone", capacity: 20, queueLength: 5 },
  { id: 2, facilityId: 1, name: "Weight Room", capacity: 30, queueLength: 3 }
];

export const queues = [
  { id: 1, userId: 1, zoneId: 1, position: 2, estimatedWait: 10, status: "active" },
  { id: 2, userId: 2, zoneId: 2, position: 1, estimatedWait: 5, status: "active" }
];

export const users = [
  { id: 1, name: "Alice", email: "alice@nyu.edu", password: "1234" },
  { id: 2, name: "Bob", email: "bob@nyu.edu", password: "abcd" }
];

export const goals = [
  { id: 1, userId: 1, goal: "Run 5 km", progress: 60 },
  { id: 2, userId: 2, goal: "Bench 150 lbs", progress: 40 }
];

export const history = [
  { id: 1, userId: 1, workout: "Cardio", duration: 30, calories: 250 },
  { id: 2, userId: 2, workout: "Weights", duration: 45, calories: 400 }
];

export const notifications = [
  { id: 1, userId: 1, message: "Your queue spot is ready", read: false },
  { id: 2, userId: 2, message: "Goal progress updated", read: true }
];

// ✅ Helper function to generate next available ID
export function getNextId(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) return 1;
  return Math.max(...dataArray.map(item => item.id)) + 1;
}
