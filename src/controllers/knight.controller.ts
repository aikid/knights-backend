import { Controller, Get, Query, Param, HttpException, HttpStatus, Post, Body, UsePipes, HttpCode, Patch, Delete } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
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
  name: z.string().min(1, "Name cannot be empty").max(50, "Name too long"),
  nickname: z.string().min(1, "Nickname cannot be empty").max(15, "Nickname too long"),
  birthday: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format. Use ISO 8601 format.",
  }),
  attributes: attributesSchema,
  weapons: z.array(weaponSchema),
  keyAttribute: z.string(),
})

const updateNicknameSchema = z.object({
  nickname: z.string().min(1, "Nickname cannot be empty").max(15, "Nickname too long"),
});


type CreateKnightBodySchema = z.infer<typeof createKnightBodySchema>
type UpdateNicknameSchema = z.infer<typeof updateNicknameSchema>

@ApiTags('knights')
@Controller('/knights')
export class KnightController {
  constructor(
    private prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os cavaleiros, com opção de filtrar apenas os heróis' })
  @ApiQuery({ name: 'filter', required: false, enum: ['heroes'], description: 'Filtro opcional para listar apenas os cavaleiros heróis' })
  @ApiResponse({ status: 200, description: 'Lista de cavaleiros retornada com sucesso' })
  async getKnights(@Query('filter') filter: any): Promise<any[]> {
    if(filter && filter === 'heroes') {
      const heroes = await this.prisma.knight.findMany({where: { isHero: true }})
      return heroes
    }
    const knights = await this.prisma.knight.findMany()
    return knights
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Obtém um cavaleiro específico pelo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID do cavaleiro' })
  @ApiResponse({ status: 200, description: 'Cavaleiro encontrado' })
  @ApiResponse({ status: 404, description: 'Cavaleiro não encontrado' })
  async getKnight(@Param('id') id: any): Promise<any> {
      const knight = await this.prisma.knight.findUnique({where: { id: id }})
      if(!knight) throw new HttpException("knight not found!", HttpStatus.BAD_REQUEST)
      return knight
  }

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createKnightBodySchema))
  @ApiOperation({ summary: 'Cria um novo cavaleiro' })
  @ApiBody({ 
    description: 'Dados do cavaleiro',
    schema: {
      example: {
        name: "Lancelot",
        nickname: "K_lancelot",
        birthday: "1990-01-01T00:00:00.000Z",
        weapons: [
          {
            name: "Sword",
            mod: 3,
            attr: " strength",
            equipped: true
          }
        ],
        attributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        keyAttribute: "strength",
        isHero: false,
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Cavaleiro criado com sucesso' })
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
  @ApiOperation({ summary: 'Atualiza o nickname de um cavaleiro' })
  @ApiParam({ name: 'id', required: true, description: 'ID do cavaleiro' })
  @ApiBody({
    description: 'Novo nickname',
    schema: { example: { nickname: "Sir_Lancelot" } }
  })
  @ApiResponse({ status: 200, description: 'Nickname atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cavaleiro não encontrado' })
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

      const updateKnight = await this.prisma.knight.update({
        where: { id },
        data: { nickname },
      });

      return updateKnight
    } catch (error) {
      console.error(error);
      throw new HttpException(`Failed to update knight: ${error?.response}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Promove um cavaleiro a herói' })
  @ApiParam({ name: 'id', required: true, description: 'ID do cavaleiro' })
  @ApiResponse({ status: 200, description: 'Cavaleiro promovido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cavaleiro não encontrado' })
  async promoteKnight(@Param('id') id: string): Promise<any> {
    try {
      const knight = await this.prisma.knight.findUnique({
        where: { id },
      });

      if (!knight) {
        throw new HttpException('Knight not found!', HttpStatus.NOT_FOUND);
      }

      const promotedKnight = await this.prisma.knight.update({
        where: { id },
        data: { isHero: true },
      });

      return promotedKnight
    } catch (error) {
      console.error(error);
      throw new HttpException(`Failed to promote knight: ${error?.response}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}