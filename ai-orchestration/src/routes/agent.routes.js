import { Router } from 'express'
import agent from '../agents/code.agent.js'

const agentRouter = Router()


agentRouter.post('/invoke', async (req, res) => {
    try {
        const { message } = req.body
        console.log("========== AI INVOKE ==========");
        console.log("BODY:", req.body);
        console.log("MESSAGE:", message);
        console.log("MESSAGE TYPE:", typeof message);
        console.log("MESSAGE LENGTH:", message?.length);
        console.log("================================");
        const response = await agent.invoke({
            messages: [
                { role: "user", content: message }
            ]
        })
        res.status(200).json({
            message: response
        })
    } catch (error) {
        console.error('Error invoking agent:', error)
        res.status(500).json({
            error: 'An error occurred while invoking the agent.'
        })
    }
});
export default agentRouter