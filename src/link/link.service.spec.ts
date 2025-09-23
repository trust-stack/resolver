import {beforeEach, describe, expect, it, vi} from "vitest";

vi.mock("../db/instance", () => ({getDb: vi.fn()}));

import {links} from "../db/schema";
import {LinkService} from "./link.service";

type MockDb = {
  insert: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const createMockDb = (): MockDb => ({
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

const linkRow = () => ({
  id: "link-id",
  createdAt: new Date(),
  path: "qualifier/identifier",
  relationType: "related",
  href: "https://example.com",
  title: "Example",
});

describe("LinkService", () => {
  let db: MockDb;
  let service: LinkService;

  beforeEach(() => {
    db = createMockDb();
    service = new LinkService(db as any);
    vi.clearAllMocks();
  });

  describe("createLink", () => {
    it("creates and returns a link", async () => {
      const returning = vi.fn().mockResolvedValue([linkRow()]);
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({returning}),
      });

      const result = await service.createLink({
        path: "qualifier/identifier",
        relationType: "related",
        href: "https://example.com",
        title: "Example",
      });

      expect(result).toMatchObject({id: "link-id"});
      expect(db.insert).toHaveBeenCalledWith(links);
      expect(returning).toHaveBeenCalled();
    });
  });

  describe("getLink", () => {
    it("returns null when not found", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({limit: vi.fn().mockResolvedValue([])}),
        }),
      });

      const link = await service.getLink("missing");

      expect(link).toBeNull();
    });

    it("returns a mapped link", async () => {
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([linkRow()]),
          }),
        }),
      });

      const link = await service.getLink("link-id");

      expect(link).toMatchObject({id: "link-id"});
    });
  });

  describe("updateLink", () => {
    it("returns null when nothing updated", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({returning: vi.fn().mockResolvedValue([])}),
        }),
      });

      const link = await service.updateLink("missing", {title: "New"});

      expect(link).toBeNull();
    });

    it("returns the updated link", async () => {
      db.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([
              {...linkRow(), title: "Updated"},
            ]),
          }),
        }),
      });

      const link = await service.updateLink("link-id", {title: "Updated"});

      expect(link).toMatchObject({title: "Updated"});
    });
  });

  describe("deleteLink", () => {
    it("returns true when deleted", async () => {
      db.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{id: "link-id"}]),
        }),
      });

      const deleted = await service.deleteLink("link-id");

      expect(deleted).toBe(true);
    });
  });

  describe("listLinks", () => {
    it("returns paginated results", async () => {
      db.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                offset: vi.fn().mockResolvedValue([linkRow()]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue([{count: 1}]),
        });

      const result = await service.listLinks({page: 1, perPage: 10});

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
