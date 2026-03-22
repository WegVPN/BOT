import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/user.entity';
import { Role, Permission } from '../../entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;
  let rolesRepository: Repository<Role>;
  let jwtService: JwtService;

  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
    nickname: 'TestUser',
    password_hash: 'hashedPassword',
    status: UserStatus.ACTIVE,
    role: {
      id: 1,
      name: 'user',
      permissions: [Permission.READ_FORUM, Permission.CREATE_TOPIC],
    },
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  };

  const mockRolesRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRolesRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@example.com', 'password');
      
      expect(result).toBeDefined();
      expect(result?.password_hash).toBeUndefined();
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['role'],
      });
    });

    it('should return null if user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);
      mockRolesRepository.findOne.mockResolvedValue({
        id: 1,
        name: 'user',
        permissions: [Permission.READ_FORUM],
      });
      
      const createdUser = { ...mockUser, password_hash: undefined };
      mockUsersRepository.create.mockReturnValue(createdUser);
      mockUsersRepository.save.mockResolvedValue(createdUser);

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));

      const result = await service.register('test@example.com', 'password', 'TestUser');
      
      expect(result).toBeDefined();
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register('test@example.com', 'password', 'TestUser'),
      ).rejects.toThrow('Email already registered');
    });
  });
});
