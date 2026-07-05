const axios = require('axios')

async function test() {
  try {
    // 1. login as owner
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'owner@test.com', // we will use real user if we can find one, or just hit DB directly
      password: 'password123'
    })
  } catch (err) {
    console.error(err)
  }
}
test()
