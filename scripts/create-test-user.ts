import { auth } from "../lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"

async function createTestUser() {
  try {
    await createUserWithEmailAndPassword(auth, "admin@example.com", "aoi1234")
    console.log("Test user created successfully")
  } catch (error) {
    console.error("Error creating test user:", error)
  }
}

createTestUser() 