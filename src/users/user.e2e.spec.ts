import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../infra/database/prisma/prisma.service';
import { AppModule } from '../app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany({});
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        document: '12345678901',
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: createUserDto.name,
          email: createUserDto.email,
          document: createUserDto.document,
          isActive: createUserDto.isActive,
        }),
      );
    });
  });

  describe('GET /users', () => {
    it('should return a list of users', async () => {
      await prismaService.user.createMany({
        data: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'hashedPassword',
            document: '12345678901',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'hashedPassword',
            document: '987654321',
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'John Doe' }),
          expect.objectContaining({ name: 'Jane Doe' }),
        ]),
      );
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const user = await prismaService.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword',
          document: '12345678901',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
          document: user.document,
          isActive: user.isActive,
        }),
      );
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await prismaService.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword',
          document: '12345678901',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const updateUserDto = {
        name: 'John Updated',
        email: 'john.updated@example.com',
        isActive: false,
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          name: updateUserDto.name,
          email: updateUserDto.email,
          document: user.document,
          isActive: updateUserDto.isActive,
        }),
      );
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await prismaService.user.create({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'hashedPassword',
          document: '12345678901',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200);

      const deletedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });

      expect(deletedUser).toBeNull();
    });
  });
});
