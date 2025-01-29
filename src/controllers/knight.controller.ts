import { Controller, Get, Query, Param, HttpException, HttpStatus, Post, Body, UsePipes, HttpCode, Patch, Delete } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';


const weaponSchema = z.object({
  name: z.string(),
  mod: z.number(),
  attr: z.string(),
  equipped: z.boolean(),
});

const attributesSchema = z.object({
  strength: z.number(),
  dexterity: z.number(),
  constitution: z.number(),
  intelligence: z.number(),
  wisdom: z.number(),
  charisma: z.number(),
});

const createKnightBodySchema = z.object({
  name: z.string(),
  nickname: z.string(),
  birthday: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Use ISO 8601 format.",
  }),
  attributes: attributesSchema,
  weapons: z.array(weaponSchema),
  keyAttribute: z.string(),
})

const updateNicknameSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty").max(50, "Nickname too long"),
});


type CreateKnightBodySchema = z.infer<typeof createKnightBodySchema>
type UpdateNicknameSchema = z.infer<typeof updateNicknameSchema>

@Controller('/knights')
export class KnightController {
  constructor(
    private prisma: PrismaService
  ) {}

  @Get()
  async getKnights(@Query('filter') filter: any): Promise<any> {
    if(filter && filter === 'heroes') {
      const heroes = await this.prisma.knight.findMany({where: { isHero: true }})
      return heroes
    }
    const knights = await this.prisma.knight.findMany()
    return knights
  }

  @Get('/:id')
  async getKnight(@Param('id') id: any): Promise<any> {
      const knight = await this.prisma.knight.findUnique({where: { id: id }})
      if(!knight) throw new HttpException("knight not found!", HttpStatus.BAD_REQUEST)
      return knight
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createKnightBodySchema))
  async createKnight(@Body() body: CreateKnightBodySchema): Promise<any> {
    try {
      const {name,nickname,birthday,weapons,attributes,keyAttribute} = body

      const knightWithSameNickName = await this.prisma.knight.findUnique({where: { nickname: nickname }})
      if(knightWithSameNickName) throw new HttpException("This nickname already belongs to a knight!", HttpStatus.INTERNAL_SERVER_ERROR)

      const newKnight = await this.prisma.knight.create({
        data: {
          name,
          nickname,
          birthday,
          weapons,
          attributes,
          keyAttribute,
          isHero: false
        },
      });
      return newKnight;
    } catch (error) {
      console.error(error);
      throw new HttpException(`Failed to create a knight: ${error?.response}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch('/:id/nickname')
  @HttpCode(204)
  async updateNickname(
    @Param('id') id: string, 
    @Body(new ZodValidationPipe(updateNicknameSchema)) body: UpdateNicknameSchema
  ): Promise<any> {
    try {
      const { nickname } = body;

      const knight = await this.prisma.knight.findUnique({
        where: { id },
      });

      if (!knight) {
        throw new HttpException('Knight not found!', HttpStatus.NOT_FOUND);
      }

      const existingKnight = await this.prisma.knight.findUnique({
        where: { nickname },
      });

      if (existingKnight) {
        throw new HttpException('This nickname is already in use!', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.knight.update({
        where: { id },
        data: { nickname },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(`Failed to update knight: ${error?.response}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/:id')
  @HttpCode(204)
  async promoteKnight(@Param('id') id: string): Promise<any> {
    try {
      const knight = await this.prisma.knight.findUnique({
        where: { id },
      });

      if (!knight) {
        throw new HttpException('Knight not found!', HttpStatus.NOT_FOUND);
      }

      await this.prisma.knight.update({
        where: { id },
        data: { isHero: true },
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(`Failed to promote knight: ${error?.response}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}