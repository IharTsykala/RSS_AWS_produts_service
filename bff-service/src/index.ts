import express from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import NodeCache from 'node-cache'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

const cache = new NodeCache({ stdTTL: 120 })

app.use(express.json())

app.get('/products', async (req, res) => {
  const cachedProducts = cache.get('products')

  if (cachedProducts) {
    console.log('Took products from cash')
    return res.json(cachedProducts)
  }

  try {
    const recipientURL = process.env['products']
    const response = await axios.get(`${recipientURL}/products`)
    const products = response.data

    cache.set('products', products, 120) // Cache for 2 minutes (120 seconds)
    console.log('Products was cashed')

    res.json(products)
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data)
    } else {
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
})

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
