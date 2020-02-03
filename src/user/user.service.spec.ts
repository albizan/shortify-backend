import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { LinkService } from '../link/link.service';

describe('UserService', () => {
  let service: UserService;

  // Define Mocks
  const mockUserRepository = new (jest.fn(() => ({
    create: jest.fn(),
    save: jest.fn()
  })))();
  const mockLinkService = {}
  const mockRegisterDto = {
    name: 'Test Name',
    email: 'Test Email',
    password: 'Test Password'
  }
  const mockUser = {
    id: 'Test Id',
    name: 'Test Name',
    email: 'Test Email',
    password: 'Test Password',
    links: []
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {provide: getRepositoryToken(User), useValue: mockUserRepository}, {provide: LinkService, useValue: mockLinkService}],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test Register Method
  describe('register Method', () => {
    it('Should create new users if no errors are thrown', async () => {
      mockUserRepository.create.mockReturnValue(mockUser)
      mockUserRepository.save.mockResolvedValue('User saved')

      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      const user = await service.register(mockRegisterDto)
      expect(user.id).toBe('Test Id')
      expect(user.name).toBe('Test Name')
      expect(user.email).toBe('Test Email')
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1)
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser)
    })

    it('Should throw Internal Server Error if userRepository.save throws error', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: []
      })
      mockUserRepository.save.mockRejectedValue(new Error('Test Error'));

      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      // service.register is an async function, I need to use rejects before toThrow
      expect(service.register(mockRegisterDto)).rejects.toThrowError('Internal Error, user was not saved')
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1)
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
    })

    it('Should throw Conflict Exception if userRepository.save throws error with code 23505', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: []
      })
      mockUserRepository.save.mockRejectedValue({
        code: '23505'
      });
      

      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      // service.register is an async function, I need to use rejects before toThrow
      expect(service.register(mockRegisterDto)).rejects.toThrowError('Username already exists')
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1)
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  // Test SanitizeUser Method
  describe('sanitizeUser Method', () => {
    it('Should sanitize users', () => {
      let user: any = new User()
      const sanitized = {
        id: "Test Id",
        name: "Test Name",
        email: "Test Email",
      }
      user = {
        ...sanitized,
        password: 'Test Password',
        otherThingsToBeSanitized: 'Test'
      }
      const sanitizedUser = service.sanitizeUser(user)
      expect(sanitizedUser).toEqual(sanitized)
    })
    

  })
});
