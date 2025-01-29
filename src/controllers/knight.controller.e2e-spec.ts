import { INestApplication } from "@nestjs/common";
import { AppModule } from "src/app.module";
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create Knight (E2E)', () => {
    let app: INestApplication;
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
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
    })
})