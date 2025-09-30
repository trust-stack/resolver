import { LinkRow } from '../link/link.dto';

export interface ResolverRepository {
  listByPath(path: string): Promise<LinkRow[]>;
}
