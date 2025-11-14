// Simple load test script to simulate multiple users tapping
import { api } from '../utils/api'

interface LoadTestResult {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  macroDetections: number
}

async function simulateUserTaps(userId: number, tapCount: number): Promise<number> {
  let macroDetections = 0
  
  for (let i = 0; i < tapCount; i++) {
    try {
      // Add random delay between taps (100-500ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100))
      
      await api.recordTap()
      
      // Occasionally try rapid tapping to test macro detection
      if (Math.random() < 0.1) {
        // Try 20 rapid taps
        for (let j = 0; j < 20; j++) {
          try {
            await api.recordTap()
          } catch (error) {
            macroDetections++
            break // Stop rapid tapping if macro detected
          }
        }
      }
    } catch {
      console.log(`User ${userId} tap ${i} failed`)
    }
  }
  
  return macroDetections
}

async function runLoadTest(concurrentUsers: number, tapsPerUser: number): Promise<LoadTestResult> {
  const startTime = Date.now()
  const results: LoadTestResult = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    macroDetections: 0
  }

  console.log(`🚀 Starting load test with ${concurrentUsers} users, ${tapsPerUser} taps each...`)

  // Create concurrent users
  const userPromises = Array.from({ length: concurrentUsers }, (_, i) => 
    simulateUserTaps(i + 1, tapsPerUser)
  )

  try {
    const macroDetections = await Promise.all(userPromises)
    results.macroDetections = macroDetections.reduce((sum, count) => sum + count, 0)
    results.totalRequests = concurrentUsers * tapsPerUser
    results.successfulRequests = results.totalRequests - results.macroDetections
    
    const endTime = Date.now()
    results.averageResponseTime = (endTime - startTime) / results.totalRequests

    console.log('📊 Load Test Results:')
    console.log(`   Total Requests: ${results.totalRequests}`)
    console.log(`   Successful: ${results.successfulRequests}`)
    console.log(`   Failed: ${results.failedRequests}`)
    console.log(`   Macro Detections: ${results.macroDetections}`)
    console.log(`   Average Response Time: ${results.averageResponseTime.toFixed(2)}ms`)
    
    return results
  } catch (error) {
    console.error('Load test failed:', error)
    throw error
  }
}

// Run the load test
if (import.meta.main) {
  const concurrentUsers = 10 // Simulate 10 concurrent users
  const tapsPerUser = 50 // Each user taps 50 times
  
  runLoadTest(concurrentUsers, tapsPerUser)
    .then(() => {
      console.log('✅ Load test completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ Load test failed:', error)
      process.exit(1)
    })
}

export { runLoadTest }