import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { LinkService } from '../link/link.service';

describe('UserService', () => {
  let service: UserService;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {provide: getRepositoryToken(User), useValue: mockUserRepository}, {provide: LinkService, useValue: mockLinkService}],
    }).compile();

    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register Method', () => {
    it('Should create new users if no errors are thrown', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: []
      })

      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      const user = await service.register(mockRegisterDto)
      expect(user.id).toBe('Test Id')
      expect(user.name).toBe('Test Name')
      expect(user.email).toBe('Test Email')
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1)
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1)
    })

    it('Should throw error', async () => {
      mockUserRepository.create.mockReturnValue({
        id: 'Test Id',
        links: []
      })
      mockUserRepository.save.mockImplementation(() => {
        Promise.reject(new Error())
      })

      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
      expect(async () => await service.register(mockRegisterDto)).toThrowError()
    })
  })
});
