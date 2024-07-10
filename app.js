const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const isValid = require('date-fns/isValid')

let app = express()
app.use(express.json())

let db = null
let dbPath = path.join(__dirname, 'todoApplication.db')

const DbServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server connected at : http://localhost:3000')
    })
  } catch (e) {
    console.log(`Error occured '{e.message}'`)
  }
}

DbServer()

app.get('/todos/', async (request, response) => {
  let {status, priority, search_q = '', category} = request.query
  let getQuery = null
  let checking = null
  let result1 = null
  switch (true) {
    case status !== undefined &&
      priority === undefined &&
      search_q === '' &&
      category === undefined:
      checking = `SELECT * FROM todo WHERE status = '${status}'`
      request1 = await db.get(checking)
      if (request1 === undefined) {
        response.status(400)
        response.send('Invalid Todo Status')
      } else {
        getQuery = `
       SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE status = '${status}'`
        let result2 = await db.all(getQuery)
        response.send(result2)
      }
      break
    case status === undefined &&
      priority !== undefined &&
      search_q === '' &&
      category === undefined:
      checking = `SELECT * FROM todo WHERE priority = '${priority}'`
      request1 = await db.get(checking)
      if (request1 === undefined) {
        response.status(400)
        response.send('Invalid Todo Priority')
      } else {
        getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE priority = '${priority}'`

        let result2 = await db.all(getQuery)
        response.send(result2)
      }

      break
    case status !== undefined &&
      priority !== undefined &&
      search_q === '' &&
      category === undefined:
      checking = `SELECT * FROM todo WHERE status = '${status}'`
      request1 = await db.get(checking)
      if (priority === 'LOW' || priority === 'HIGH' || priority === 'MEDIUM') {
        if (request1 === undefined) {
          response.status(400)
          response.send('Invalid Todo Status')
        } else {
          getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE priority = '${priority}' AND status = '${status}'`

          let result2 = await db.all(getQuery)
          response.send(result2)
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }

      break
    case status === undefined &&
      priority === undefined &&
      search_q !== '' &&
      category === undefined:
      checking = `SELECT * FROM todo WHERE todo LIKE  "%${search_q}%"`
      request1 = await db.get(checking)
      if (request1 === undefined) {
        response.status(400)
        response.send('Invalid Todo')
      } else {
        getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE todo LIKE "%${search_q}%"`

        let result2 = await db.all(getQuery)
        response.send(result2)
      }

      break

    case status !== undefined &&
      priority === undefined &&
      search_q === '' &&
      category !== undefined:
      let checking1 = `SELECT * FROM todo WHERE status = '${status}'`
      let checking2 = `SELECT * FROM todo WHERE category = '${category}'`

      request1 = await db.get(checking1)
      let request2 = await db.get(checking2)

      if (request1 === undefined) {
        response.status(400)
        response.send('Invalid Todo Status')
      } else if (request2 === undefined) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else if (request1 === undefined && request2 === undefined) {
        response.status(400)
        response.send('Invalid Todo Status and category')
      } else {
        getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE category = '${category}' AND status = '${status}'`

        let result2 = await db.all(getQuery)
        response.send(result2)
      }
      break

    case status === undefined &&
      priority === undefined &&
      search_q === '' &&
      category !== undefined:
      checking = `SELECT * FROM todo WHERE category = '${category}'`

      request1 = await db.get(checking)

      if (request1 === undefined) {
        response.status(400)
        response.send('Invalid Todo Category')
      } else {
        getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE category = '${category}'`

        let result2 = await db.all(getQuery)
        response.send(result2)
      }
      break
    case status === undefined &&
      priority !== undefined &&
      search_q === '' &&
      category !== undefined:
      checking = `SELECT * FROM todo WHERE category = '${category}'`
      request1 = await db.get(checking)
      if (priority === 'LOW' || priority === 'HIGH' || priority === 'MEDIUM') {
        if (request1 === undefined) {
          response.status(400)
          response.send('Invalid Todo Category')
        } else {
          getQuery = `
        SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE priority = '${priority}' AND category = '${category}'`

          let result2 = await db.all(getQuery)
          response.send(result2)
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }

      break
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE id = '${todoId}'`
  let result1 = await db.get(getQuery)
  response.send(result1)
})

app.get('/agenda/', async (request, response) => {
  let {date} = request.query

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')

    let getQuery = `SELECT id,todo,priority,status,category,due_date as dueDate
        FROM todo
        WHERE due_date = '${newDate}'`
    let result1 = await db.all(getQuery)
    response.send(result1)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status, category, dueDate} = request.body

  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postnewDate = format(new Date(dueDate), 'yyyy-MM-dd')
          let postQuery = `
  INSERT INTO todo (id,todo,priority,status,category,due_date)
  VALUES (
    '${id}',
    '${todo}',
    '${priority}',
    '${status}',
    '${category}',
    '${postnewDate}'

  )`

          let request1 = await db.run(postQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

app.put('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let {status, priority, todo, category, dueDate} = request.body
  let validateStatus = () => {
    return status !== undefined
  }
  let validatePriority = () => {
    return priority !== undefined
  }
  let validateTodo = () => {
    return todo !== undefined
  }
  let validateCategory = () => {
    return category !== undefined
  }
  let validateDuedate = () => {
    return dueDate !== undefined
  }
  let putQuery = null
  switch (true) {
    case validateStatus():
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        putQuery = `
      UPDATE todo
       SET
        status = '${status}'
          WHERE id = '${todoId}'`
        await db.run(putQuery)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break
    case validatePriority():
      if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
        putQuery = `
      UPDATE todo
       SET
        priority = '${priority}'
          WHERE id = '${todoId}'`
        await db.run(putQuery)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break
    case validateTodo():
      putQuery = `
      UPDATE todo
       SET
        todo = '${todo}'
          WHERE id = '${todoId}'`
      await db.run(putQuery)
      response.send('Todo Updated')
      break
    case validateCategory():
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        putQuery = `
      UPDATE todo
       SET
        category = '${category}'
          WHERE id = '${todoId}'`
        await db.run(putQuery)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break
    case validateDuedate():
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const postnewDate = format(new Date(dueDate), 'yyyy-MM-dd')
        putQuery = `
      UPDATE todo
       SET
        due_date = '${postnewDate}'
          WHERE id = '${todoId}'`
        await db.run(putQuery)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let deleteQuery = `
  DELETE FROM todo
  WHERE id = '${todoId}'`

  await db.run(deleteQuery)
  response.send('Todo Deleted')
})

module.exports = app
