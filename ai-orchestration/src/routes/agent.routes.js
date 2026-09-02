import { Router } from 'express'
import agent from '../agents/code.agent.js'

const agentRouter = Router()

agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message, projectId } = req.body

        // Validate FIRST
        if (!message || !projectId) {
            return res.status(400).json({ error: 'message and projectId are required.' })
        }

        // Setup SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        })

        const stream = await agent.stream(
            {
                messages: [{ role: "user", content: message }]
            },
            {
                context: { projectId },
                streamMode: "custom"
            }
        )

        // Stream chunks
        for await (const chunk of stream) {
            console.log('Chunk:', chunk)
            res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }

        res.write('data: [DONE]\n\n')
        res.end()

    } catch (error) {
        console.error('Error invoking agent:', error)

        if (res.headersSent) {
            let errorMsg = 'An error occurred'
            if (error?.statusCode === 429 || error?.message?.includes('rate_limited')) {
                errorMsg = 'The AI service is currently rate limited. Please try again in a minute.'
            } else if (error?.message?.toLowerCase().includes('timeout')) {
                errorMsg = 'The request took too long to process. Please try again.'
            }
            
            res.write(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`)
            res.end()
            return
        }

        if (error?.statusCode === 429 || error?.message?.includes('rate_limited') || error?.message?.includes('429')) {
            return res.status(429).json({
                error: 'The AI service is currently rate limited. Please try again in a minute.'
            })
        }

        if (error?.name === 'TimeoutError' || error?.message?.toLowerCase().includes('timeout')) {
            return res.status(504).json({
                error: 'The request took too long to process. Please try again.'
            })
        }

        res.status(500).json({
            error: 'An error occurred while invoking the agent.'
        })
    }
})

export default agentRouter