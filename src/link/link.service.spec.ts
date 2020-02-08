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
});
