import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from "src/prisma/prisma.service";

describe('Create Knight (E2E)', () => {
    let app: INestApplication
    let prisma: PrismaService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication()
        prisma = moduleRef.get(PrismaService)
        await app.init();
    });

    test('[POST] /knights', async () => {
        const response = await request(app.getHttpServer()).post('/knights').send({
            name: "Matias", 
            nickname: "mat_Twilight", 
            birthday: "1994-03-27T00:00:00Z", 
            weapons: [ 
                { 
                    name: "sword", 
                    mod: 3, 
                    attr: " strength", 
                    equipped: true 
                } 
            ], 
            attributes: { 
                strength: 0, 
                dexterity: 0, 
                constitution: 0, 
                intelligence: 0, 
                wisdom: 0, 
                charisma: 0 
            },
            keyAttribute: "strength",
            isHero: false 
        })

        expect(response.statusCode).toBe(201)

        const userOnDatabase = await prisma.knight.findUnique({
            where: {
                nickname: 'mat_Twilight'
            }
        })

        expect(userOnDatabase).toBeTruthy()
    })

    test('[GET] /knights', async () => {
        const response = await request(app.getHttpServer()).get('/knights')
        expect(response.statusCode).toBe(200)
    })

    afterAll(async () => {
        await app.close();
    });
})