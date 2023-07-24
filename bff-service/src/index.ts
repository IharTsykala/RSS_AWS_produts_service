import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 3000 // Change this port number as needed

// Middleware to parse JSON bodies
app.use(express.json())

// BFF Service route
app.all('/:recipientServiceName', async (req, res) => {
  try {
    const recipientServiceName = req.params.recipientServiceName
    const recipientURL = process.env[recipientServiceName]

    if (!recipientURL) {
      return res.status(502).json({ error: 'Cannot process request' })
    }

    const method = req.method
    const url = `${recipientURL}${req.url}`

    const response = await axios({
      method,
      url,
      data: req.body,
    })

    res.status(response.status).json(response.data)
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
})

app.listen(port, () => {
  console.log(`BFF Service is running on http://localhost:${port}`)
})
