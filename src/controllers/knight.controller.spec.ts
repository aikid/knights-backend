import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { KnightController } from "./knight.controller";
import { PrismaService } from "../prisma/prisma.service";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("KnightController", () => {
  let controller: KnightController;
  let prismaService: Partial<PrismaService>;

  beforeEach(async () => {
    prismaService = {
      knight: {
        findMany: vi.fn().mockImplementation(async () => []), // Retorna um array vazio por padrão
        findUnique: vi.fn().mockImplementation(async () => null), // Simula busca sem resultado
        create: vi.fn().mockImplementation(async (data) => ({
          id: "1",
          ...data.data, // Retorna os dados criados
        })),
        update: vi.fn().mockImplementation(async (args) => ({
          ...args.data, // Atualiza os dados simulados
          id: args.where.id,
        })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnightController],
      providers: [{ provide: PrismaService, useValue: prismaService }],
    }).compile();

    controller = module.get<KnightController>(KnightController);
  });

  /**
   * 🔹 Teste da Listagem de Cavaleiros
   */
  it("deve retornar uma lista de cavaleiros", async () => {
    prismaService.knight.findMany = vi.fn().mockResolvedValue([
      { id: "1", name: "Arthur", nickname: "King" },
    ]);

    const result = await controller.getKnights(null);
    expect(result).toEqual([{ id: "1", name: "Arthur", nickname: "King" }]);
  });

  /**
   * 🔹 Teste da Busca de um Cavaleiro Específico
   */
  it("deve retornar um cavaleiro específico pelo ID", async () => {
    prismaService.knight.findUnique = vi.fn().mockResolvedValue({
      id: "1",
      name: "Lancelot",
      nickname: "Brave",
    });

    const result = await controller.getKnight("1");
    expect(result).toEqual({ id: "1", name: "Lancelot", nickname: "Brave" });
  });

  it("deve lançar erro 400 se o cavaleiro não for encontrado", async () => {
    prismaService.knight.findUnique = vi.fn().mockResolvedValue(null);

    await expect(controller.getKnight("1")).rejects.toThrow(
      new HttpException("knight not found!", HttpStatus.BAD_REQUEST)
    );
  });

  /**
   * 🔹 Teste da Criação de um Cavaleiro
   */
  it("deve criar um cavaleiro", async () => {
    const newKnight = {
      name: "Galahad",
      nickname: "Pure",
      birthday: new Date("2000-01-01T00:00:00.000Z"),
      weapons: [
        {
          name: "Axe",
          mod: 3,
          attr: "strength",
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
    };

    prismaService.knight.findUnique = vi.fn().mockResolvedValue(null); // Nenhum cavaleiro com esse nickname existe
    prismaService.knight.create = vi.fn().mockResolvedValue({
      id: "2",
      ...newKnight,
    });

    const result = await controller.createKnight(newKnight);
    expect(result).toMatchObject({
      id: "2",
      ...newKnight,
    });
  });

  /**
   * 🔹 Teste da Atualização do Nickname
   */
  it("deve atualizar o nickname de um cavaleiro", async () => {
    const existingKnight = { id: "1", name: "Percival", nickname: "Knight" };

    prismaService.knight.findUnique = vi.fn()
      .mockResolvedValueOnce(existingKnight) // Cavaleiro existe
      .mockResolvedValueOnce(null); // Novo nickname não está em uso

    prismaService.knight.update = vi.fn().mockResolvedValue({
      ...existingKnight,
      nickname: "Sir_Percival",
    });

    const result = await controller.updateNickname("1", { nickname: "Sir_Percival" });

    expect(result).toMatchObject({
      id: "1",
      nickname: "Sir_Percival",
    });
  });

  /**
   * 🔹 Teste da Promoção a Herói
   */
  it("deve promover um cavaleiro a herói", async () => {
    const knight = { id: "1", name: "Lancelot", isHero: false };

    prismaService.knight.findUnique = vi.fn().mockResolvedValue(knight);
    prismaService.knight.update = vi.fn().mockResolvedValue({ ...knight, isHero: true });

    const result = await controller.promoteKnight("1");

    expect(result.isHero).toBe(true);
  });

  it("deve retornar erro 404 se o cavaleiro não for encontrado para promoção", async () => {
    prismaService.knight.findUnique = vi.fn().mockResolvedValue(null);

    await expect(controller.promoteKnight("999")).rejects.toThrow(
        expect.objectContaining({ message: expect.stringContaining("Knight not found!") })
    );
  });
});
