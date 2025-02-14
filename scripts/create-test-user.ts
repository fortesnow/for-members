import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

async function createTestUser() {
  if (!auth) throw new Error("Firebase Auth is not initialized")

  try {
    await createUserWithEmailAndPassword(auth, "admin@example.com", "aoi1234")
    console.log("Test user created successfully")
  } catch (error) {
    console.error("Error creating test user:", error)
  }
}

createTestUser() 