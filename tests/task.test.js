jest.mock('../src/models/Task')

const Task = require('../src/models/Task')
const request = require('supertest')
const app = require('../src/server')

describe('Task Manager API', () => {
  // get
  test('GET /api/health returns a successful response', async () => {
    const response = await request(app).get('/api/health')
    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Task Manager API is running')
  })
  // create
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
  // unkown routes
  test('Unknown routes return 404', async () => {
    const response = await request(app).get('/api/unknown-route')
    expect(response.statusCode).toBe(404)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('Route not found')
  })

  // get all task paginations
  test('GET /api/tasks returns pagination metadata', async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            { title: 'Task one', completed: false },
            { title: 'Task two', completed: true }
          ])
        })
      })
    })

    Task.countDocuments.mockResolvedValue(2)
    const response = await request(app).get('/api/tasks?page=1&limit=5')

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body).toHaveProperty('total')
    expect(response.body).toHaveProperty('page', 1)
    expect(response.body).toHaveProperty('limit', 5)
    expect(response.body).toHaveProperty('totalPages')
    expect(response.body.data).toBeInstanceOf(Array)
  })

  // get task with invalids checkings
  test('GET /api/tasks rejects an invalid completed filter', async () => {
    const response = await request(app).get('/api/tasks?completed=yes')

    expect(response.statusCode).toBe(400)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toBe('completed must be true or false')
  })

  // get based on completed
  test('GET /api/tasks accepts a completed filter', async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest
            .fn()
            .mockResolvedValue([{ title: 'Completed task', completed: true }])
        })
      })
    })

    Task.countDocuments.mockResolvedValue(1)
    const response = await request(app).get('/api/tasks?completed=true')

    expect(response.statusCode).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toBeInstanceOf(Array)
    expect(response.body.data.every(task => task.completed === true)).toBe(true)
  })
})
