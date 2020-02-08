import { Test, TestingModule } from '@nestjs/testing';
import { LinkService } from './link.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Link } from './link.entity';

describe('Link Service', () => {
  let service;

  // Define Mocks
  // Define Mocks
  const mockLinkRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkService,
        { provide: getRepositoryToken(Link), useValue: mockLinkRepository },
      ],
    }).compile();

    service = module.get<LinkService>(LinkService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOriginalLink Method', () => {
    it('Should return original link with incremented clicks', async () => {
      mockLinkRepository.findOne.mockResolvedValue({
        clicks: 77,
        isActive: true,
        original: 'Original',
      });

      expect(mockLinkRepository.findOne).not.toHaveBeenCalled();
      const result = await service.getOriginalLink('Test ID');
      expect(mockLinkRepository.findOne).toHaveBeenCalledWith('Test ID');
      expect(mockLinkRepository.save).toHaveBeenCalledWith({
        clicks: 78,
        isActive: true,
        original: 'Original',
      });
      expect(result.original).toEqual('Original');
    });

    it('Should throw error if link is not active', () => {
      mockLinkRepository.findOne.mockResolvedValue({
        clicks: 56,
        isActive: false,
        original: 'Original',
      });

      expect(mockLinkRepository.findOne).not.toHaveBeenCalled();
      expect(service.getOriginalLink()).rejects.toThrow();
    });

    it('Should throw error link is not found', () => {
      mockLinkRepository.findOne.mockRejectedValue(new Error());
      expect(service.getOriginalLink()).rejects.toThrow();
    });
  });

  describe('createLink Method', () => {
    it('Should return a newly created link', async () => {
      const mockUser = {
        id: 'id',
        name: 'name',
        email: 'email',
      };
      const mockAddLinkDto = {
        title: 'test title',
        original: 'test original',
        isActive: false,
      };
      mockLinkRepository.create.mockReturnValue({});

      const result = await service.createLink(mockUser, mockAddLinkDto);
      expect(result.user).toEqual(mockUser);
      expect(result.title).toEqual('test title');
      expect(result.original).toEqual('test original');
      expect(result.isActive).toEqual(false);
      expect(result.clicks).toEqual(0);
    });
  });

  it('Should throw if save throws', () => {
    const mockUser = {
      id: 'id',
      name: 'name',
      email: 'email',
    };
    const mockAddLinkDto = {
      title: 'test title',
      original: 'test original',
      isActive: false,
    };
    mockLinkRepository.save.mockRejectedValue(new Error());

    expect(service.createLink(mockUser, mockAddLinkDto)).rejects.toThrow();
  });
});
