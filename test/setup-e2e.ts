import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

beforeAll(async () => {
    process.env.DATABASE_URL = "mongodb+srv://knights:knights2025BTG@cluster0.x6lnxin.mongodb.net/kingdomtest?retryWrites=true&w=majority"
})

afterAll(async () => {
    await prisma.$disconnect()
})