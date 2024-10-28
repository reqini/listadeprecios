import axios from 'axios'

// const url = process.env.NODE_ENV === "development" ? `http://localhost:3001` : "https://backtest-production-7f88.up.railway.app"
const url = `http://localhost:3001`

const instance = axios.create({
  baseURL: `${url}`,
})

export default instance
