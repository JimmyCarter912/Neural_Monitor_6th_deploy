export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export interface Task {
  id: string | number
  user_id: string
  task_name: string
  target: number
  completed_days: number[]
  month: number
  year: number
  updated_at: string
}

export interface Story {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface UserData {
  tasks: Task[]
  stories: Story[]
}

const USERS_KEY = "neural_monitor_users"
const USER_DATA_PREFIX = "neural_monitor_data_"

// User authentication functions
export function getAllUsers(): User[] {
  if (typeof window === "undefined") return []
  const usersJson = localStorage.getItem(USERS_KEY)
  return usersJson ? JSON.parse(usersJson) : []
}

function saveAllUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function createUser(email: string, password: string, name?: string): User {
  const users = getAllUsers()

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    throw new Error("User with this email already exists")
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password, // In production, this should be hashed
    name: name || email.split("@")[0],
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveAllUsers(users)

  // Initialize empty user data
  const userData: UserData = {
    tasks: [],
    stories: [],
  }
  localStorage.setItem(USER_DATA_PREFIX + newUser.id, JSON.stringify(userData))

  return newUser
}

export function signInUser(email: string, password: string): User {
  const users = getAllUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid email or password")
  }

  return user
}

export function updateUserName(userId: string, name: string): void {
  const users = getAllUsers()
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  users[userIndex].name = name
  saveAllUsers(users)
}

// User data functions
function getUserData(userId: string): UserData {
  const dataJson = localStorage.getItem(USER_DATA_PREFIX + userId)
  return dataJson
    ? JSON.parse(dataJson)
    : {
        tasks: [],
        stories: [],
      }
}

function saveUserData(userId: string, data: UserData) {
  localStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(data))
}

// Task functions
export function getTasks(userId: string, month: number, year: number): Task[] {
  const userData = getUserData(userId)
  return userData.tasks.filter((task) => task.month === month && task.year === year)
}

export function saveTasks(userId: string, tasks: Task[], month: number, year: number): void {
  const userData = getUserData(userId)

  // Remove old tasks for this month/year
  userData.tasks = userData.tasks.filter((task) => !(task.month === month && task.year === year))

  // Add new tasks
  const tasksWithMetadata = tasks.map((task) => ({
    ...task,
    user_id: userId,
    month,
    year,
    updated_at: new Date().toISOString(),
  }))

  userData.tasks.push(...tasksWithMetadata)
  saveUserData(userId, userData)
}

export function upsertTask(userId: string, task: Task): void {
  const userData = getUserData(userId)
  const existingIndex = userData.tasks.findIndex((t) => t.id === task.id)

  const taskWithMetadata = {
    ...task,
    user_id: userId,
    updated_at: new Date().toISOString(),
  }

  if (existingIndex !== -1) {
    userData.tasks[existingIndex] = taskWithMetadata
  } else {
    userData.tasks.push(taskWithMetadata)
  }

  saveUserData(userId, userData)
}

// Story functions
export function getStories(userId: string): Story[] {
  const userData = getUserData(userId)
  return userData.stories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function createStory(userId: string, title: string, content: string, customDate?: Date): Story {
  console.log(
    "[v0] createStory called with userId:",
    userId,
    "title:",
    title,
    "content:",
    content,
    "customDate:",
    customDate,
  )
  const userData = getUserData(userId)
  console.log("[v0] userData:", userData)

  const dateToUse = customDate || new Date()

  const newStory: Story = {
    id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    title,
    content,
    created_at: dateToUse.toISOString(),
    updated_at: new Date().toISOString(),
  }

  console.log("[v0] newStory object:", newStory)
  userData.stories.push(newStory)
  console.log("[v0] userData.stories after push:", userData.stories)
  saveUserData(userId, userData)
  console.log("[v0] saveUserData completed")

  return newStory
}

export function updateStory(userId: string, storyId: string, content: string): void {
  const userData = getUserData(userId)
  const storyIndex = userData.stories.findIndex((s) => s.id === storyId)

  if (storyIndex !== -1) {
    userData.stories[storyIndex].content = content
    userData.stories[storyIndex].updated_at = new Date().toISOString()
    saveUserData(userId, userData)
  }
}

export function deleteStory(userId: string, storyId: string): void {
  const userData = getUserData(userId)
  userData.stories = userData.stories.filter((s) => s.id !== storyId)
  saveUserData(userId, userData)
}
