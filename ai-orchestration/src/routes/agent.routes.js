import { Router } from 'express'
import agent from '../agents/code.agent.js'

const agentRouter = Router()

agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message, projectId } = req.body

        if (!message || !projectId) {
            return res.status(400).json({ error: 'message and projectId are required.' })
        }

        const stream = await agent.stream(
            {
                messages: [
                    { role: "user", content: message }
                ]
            },
            {
                context: { projectId },
                streamMode: "custom"
            }
        )

        const chunks = []
        for await (const chunk of stream) {
            console.log('Chunk:', chunk)
            chunks.push(chunk)
        }

        // Pull the final agent output out of the accumulated chunks.
        // Adjust this depending on what shape your `writer.write(...)` calls actually produce.
        const finalMessage = chunks.map(c => (typeof c === 'string' ? c : JSON.stringify(c))).join('')

        res.status(200).json({
            message: finalMessage,
            steps: chunks // optional: useful for debugging/UI progress display
        })
    } catch (error) {
        console.error('Error invoking agent:', error)

        // Distinguish rate limiting from other failures so the client can react appropriately
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