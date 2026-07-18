import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";

export type JobFilters = {
  q?: string;
  type?: string;
  category?: string;
  experienceLevel?: string;
  remote?: boolean;
  location?: string;
  minSalary?: number;
  sort?: "newest" | "oldest" | "salary_high";
  page?: number;
  pageSize?: number;
};

/** Build a Prisma `where` clause from a set of filters. */
function buildWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };
  const and: Prisma.JobWhereInput[] = [];

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    });
  }
  if (filters.type) where.type = filters.type as Prisma.JobWhereInput["type"];
  if (filters.category) where.category = filters.category;
  if (filters.experienceLevel)
    where.experienceLevel =
      filters.experienceLevel as Prisma.JobWhereInput["experienceLevel"];
  if (filters.remote) where.remote = true;
  if (filters.location?.trim())
    where.location = { contains: filters.location.trim(), mode: "insensitive" };
  if (filters.minSalary) where.salaryMax = { gte: filters.minSalary };

  if (and.length) where.AND = and;
  return where;
}

function buildOrderBy(
  sort: JobFilters["sort"]
): Prisma.JobOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest":
      return [{ postedAt: "asc" }];
    case "salary_high":
      return [{ salaryMax: { sort: "desc", nulls: "last" } }, { postedAt: "desc" }];
    default:
      // Featured jobs float to the top, then newest.
      return [{ featured: "desc" }, { postedAt: "desc" }];
  }
}

/** Paginated, filtered list of jobs plus the total match count. */
export async function getJobs(filters: JobFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const where = buildWhere(filters);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** A single job with its application count. */
export function getJob(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: { _count: { select: { applications: true } } },
  });
}

/** All jobs (any status) with application counts, for the employer dashboard. */
export function getEmployerJobs() {
  return prisma.job.findMany({
    orderBy: { postedAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
}

/** A job plus its full list of applications, for the employer detail view. */
export function getJobWithApplications(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: { applications: { orderBy: { createdAt: "desc" } } },
  });
}

/** A few featured jobs for the home page. */
export function getFeaturedJobs(take = 3) {
  return prisma.job.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { postedAt: "desc" },
    take,
  });
}

/** Distinct categories with counts, for the home page and filter hints. */
export async function getStats() {
  const [totalJobs, totalCompanies, remoteJobs] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.findMany({
      where: { status: "PUBLISHED" },
      distinct: ["company"],
      select: { company: true },
    }),
    prisma.job.count({ where: { status: "PUBLISHED", remote: true } }),
  ]);
  return { totalJobs, totalCompanies: totalCompanies.length, remoteJobs };
}
