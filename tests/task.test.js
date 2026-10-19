const request = require('supertest')
const app = require('../src/server')

describe('Task Manager API', () => {
  
  test('GET /api/health returns a successful response', async () => {
    const response = await request(app).get('/api/health')
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Task Manager API is running')
  })

  test('POST /api/tasks rejects an invalid due date', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'Prepare evaluation',
      dueDate: 'not-a-date'
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Invalid due date')
  })

  test('POST /api/tasks rejects a title shorter than 3 characters', async () => {
    const response = await request(app).post('/api/tasks').send({
      title: 'ab'
    })
    expect(response.statusCode).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe(
      'Title must contain at least 3 characters'
    )
  })

  test('Unknown routes return 404', async () => {
    const response = await request(app).get('/api/unknown-route')
    expect(response.statusCode).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Route not found')
  })
})
