import express from "express"
import morgan from "morgan"
import agentRouter from "./routes/agent.routes.js"
const app = express()


app.use(morgan('dev'))
app.use(express.json())


app.get('/api/status/healthz' , (req , res) => {
    res.status(200).json({
        message: 'Hello from AI Orchestration Service'
    })
})


app.use('/api/ai' , agentRouter)

export default app