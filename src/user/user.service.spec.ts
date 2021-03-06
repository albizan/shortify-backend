import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { LinkService } from '../link/link.service';

describe('UserService', () => {
  let service: UserService;

  // Define Mocks
  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const mockLinkService = {
    createLink: jest.fn(),
    getLinksWithQueryBuilder: jest.fn(),
    deleteLink: jest.fn(),
    patchLink: jest.fn(),
  };
  const mockRegisterDto = {
    name: 'Test Name',
    email: 'Test Email',
    password: 'Test Password',
  };
  const mockAddLinkDto = {
    title: 'Test Title',
    original: 'Test Original',
    isActive: true,
  };
  const mockUser = {
    id: 'Test Id',
    name: 'Test Name',
    email: 'Test Email',
    password: 'Test Password',
    links: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: LinkService, useValue: mockLinkService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test register Method
  describe('register Method', () => {
    it('Should create new users if no errors are thrown', async () => {
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue('User saved');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      const user = await service.register(mockRegisterDto);
      expect(user.id).toBe('Test Id');
      expect(user.name).toBe('Test Name');
      expect(user.email).toBe('Test Email');
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('Should throw Internal Server Error if userRepository.save throws error', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: [],
      });
      mockUserRepository.save.mockRejectedValue(new Error('Test Error'));

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      // service.register is an async function, I need to use rejects before toThrow
      expect(service.register(mockRegisterDto)).rejects.toThrow();
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('Should throw Conflict Exception if userRepository.save throws error with code 23505', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: [],
      });
      mockUserRepository.save.mockRejectedValue({
        code: '23505',
      });

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      // service.register is an async function, I need to use rejects before toThrow
      expect(service.register(mockRegisterDto)).rejects.toThrowError(
        'Username already exists',
      );
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // Test sanitizeUser Method
  describe('sanitizeUser Method', () => {
    it('Should sanitize users', () => {
      let user: any = new User();
      const sanitized = {
        id: 'Test Id',
        name: 'Test Name',
        email: 'Test Email',
      };
      user = {
        ...sanitized,
        password: 'Test Password',
        otherThingsToBeSanitized: 'Test',
      };
      const sanitizedUser = service.sanitizeUser(user);
      expect(sanitizedUser).toEqual(sanitized);
    });
  });

  // Test findUserByEmail Method
  describe('findUserByEmail Method', () => {
    it('Should return a user with the given email', async () => {
      const mockUser = {
        id: 'Test Id',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.findUserByEmail('Test Email');
      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: 'Test Email',
      });
    });
  });

  // Test findUserById Method
  describe('findUserById Method', () => {
    it('Should return a user with the given id', async () => {
      const mockUser = {
        id: 'Test Id',
      };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const user = await service.findUserById('Test Id');
      expect(user).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith('Test Id');
    });
  });

  // Test getUserStats Method
  describe('getUserStats Method', () => {
    it('Should return stats if no errors are thrown', async () => {
      const mockUser = {
        id: 'Test Id',
      };
      const mockLinks = [
        {
          isActive: true,
          clicks: 2,
        },
        {
          isActive: false,
          clicks: 10,
        },
      ];

      mockUserRepository.findOne.mockResolvedValue({
        links: mockLinks,
      });

      const result = await service.getUserStats('Test Id');
      expect(result).toEqual({
        totalLinks: 2,
        activeLinks: 1,
        totalClicks: 12,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith('Test Id', {
        relations: ['links'],
      });
    });

    it('Should throw error if userRepository.findOne throws Error', () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Test Error'));

      expect(service.getUserStats('Test Id')).rejects.toThrow();
    });
  });

  // Test getUserLinks
  describe('getUserLinks Method', () => {
    it('Should return user links if there is any', async () => {
      const mockLinks = { linkID: 1 };
      mockLinkService.getLinksWithQueryBuilder.mockResolvedValue(mockLinks);

      expect(mockLinkService.getLinksWithQueryBuilder).not.toHaveBeenCalled();
      const result = await service.getUserLinks('Test Id', 3, 5);
      expect(result).toEqual(mockLinks);
      expect(mockLinkService.getLinksWithQueryBuilder).toHaveBeenLastCalledWith(
        'Test Id',
        10,
        5,
      );
    });
  });

  // Test createLink
  describe('createLink Method', () => {
    it('Should return a link response object', async () => {
      const mockLinkRo = 'test';
      service.findUserById = jest.fn().mockResolvedValue('test');
      mockLinkService.createLink.mockResolvedValue(mockLinkRo);

      const result = await service.createLink('Test Id', mockAddLinkDto);
      expect(service.findUserById).toHaveBeenCalledWith('Test Id');
      expect(mockLinkService.createLink).toHaveBeenCalledWith(
        'test',
        mockAddLinkDto,
      );
      expect(result).toEqual(mockLinkRo);
    });

    it('Should throw error if no user is found', async () => {
      service.findUserById = jest.fn().mockRejectedValue('test');

      expect(
        service.createLink('Test Id', mockAddLinkDto),
      ).rejects.toThrowError('Cannot find user');
      expect(service.findUserById).toHaveBeenCalledWith('Test Id');
      expect(mockLinkService.createLink).not.toHaveBeenCalled();
    });
  });

  // test deleteLink
  describe('deleteLink Method', () => {
    it('Should return the result of linkService.deleteLink', async () => {
      service.findUserById = jest.fn().mockResolvedValue(mockUser);
      mockLinkService.deleteLink.mockResolvedValue('test');

      const result = await service.deleteLink('userId', 'linkId');
      expect(result).toEqual('test');
      expect(mockLinkService.deleteLink).toHaveBeenCalledWith(
        mockUser,
        'linkId',
      );
    });

    it('Should throw if no user are found', () => {
      service.findUserById = jest.fn().mockRejectedValue(mockUser);

      expect(service.deleteLink('userId', 'linkId')).rejects.toThrow();
      expect(mockLinkService.deleteLink).not.toHaveBeenCalled();
    });
  });

  // Test patchLink
  describe('patchLink Method', () => {
    const mockDto = {};

    it('Should return the return value of linkService.patchLink', async () => {
      mockLinkService.patchLink.mockResolvedValue('test return value');

      const result = await service.patchLink('test id', mockDto);
      expect(result).toEqual('test return value');
      expect(mockLinkService.patchLink).toHaveBeenCalledWith(
        'test id',
        mockDto,
      );
    });

    it('Should throw error if no links are found', async () => {
      mockLinkService.patchLink.mockRejectedValue(new Error('Test error'));

      expect(service.patchLink('test id', mockDto)).rejects.toThrow();
    });
  });
});
