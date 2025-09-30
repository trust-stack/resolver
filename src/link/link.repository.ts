import { CreateLinkDto, LinkDto, PaginatedLinksDto } from './link.dto';
import { ListLinksQueryDto, UpdateLinkDto } from './link.dto';

export interface LinkRepository {
  createLink(link: CreateLinkDto): Promise<LinkDto>;
  getLink(id: string): Promise<LinkDto | null>;
  updateLink(id: string, link: UpdateLinkDto): Promise<LinkDto | null>;
  deleteLink(id: string): Promise<boolean>;
  listLinks(query: ListLinksQueryDto): Promise<PaginatedLinksDto>;
}
