import { getRequestContext } from '../request-context';
import {
  CreateLinkDto,
  LinkDto,
  ListLinksQueryDto,
  PaginatedLinksDto,
  UpdateLinkDto,
} from './link.dto';
import { normalisePath, validatePath, validateType } from './link.utils';

export const linksService = {
  async createLink(dto: CreateLinkDto): Promise<LinkDto> {
    validatePath(dto.path);
    dto.type && validateType(dto.type);

    const payload: CreateLinkDto = {
      ...dto,
      path: normalisePath(dto.path),
    };

    const { linksRepository } = getRequestContext();
    return linksRepository.createLink(payload);
  },

  async getLink(id: string): Promise<LinkDto | null> {
    const { linksRepository } = getRequestContext();
    return linksRepository.getLink(id);
  },

  async updateLink(id: string, dto: UpdateLinkDto): Promise<LinkDto | null> {
    dto.path && validatePath(dto.path);
    dto.type && validateType(dto.type);

    const payload: UpdateLinkDto = {
      ...dto,
      ...(dto.path !== undefined ? { path: normalisePath(dto.path) } : {}),
    };

    const { linksRepository } = getRequestContext();
    return linksRepository.updateLink(id, payload);
  },

  async deleteLink(id: string): Promise<boolean> {
    const { linksRepository } = getRequestContext();
    return linksRepository.deleteLink(id);
  },

  async listLinks(query: ListLinksQueryDto): Promise<PaginatedLinksDto> {
    const { linksRepository } = getRequestContext();
    return linksRepository.listLinks(query);
  },
};
