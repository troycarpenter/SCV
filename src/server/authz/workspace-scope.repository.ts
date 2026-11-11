
import type { WorkspaceScopeRow } from '~/server/authz/workspace-scope-resolver'
import { db } from '~/server/db'

export type WorkspaceChoiceRow = WorkspaceScopeRow & {
  groomFirstName: string
  groomLastName: string
  brideFirstName: string
  brideLastName: string
}

export class WorkspaceScopeRepository {
  async findScopeForOrganization(
    userId: string,
    organizationId: string
  ): Promise<WorkspaceScopeRow | undefined> {
    const rows = await db.$queryRaw<WorkspaceScopeRow[]>`
      SELECT
        m."organizationId" AS "organizationId",
        FALSE AS "isPrimaryWedding",
        m."role" AS "role",
        w."id" AS "weddingId"
      FROM "member" m
      LEFT JOIN "Wedding" w ON w."organizationId" = m."organizationId"
      WHERE m."userId" = ${userId}
        AND m."organizationId" = ${organizationId}
      ORDER BY m."createdAt" ASC
      LIMIT 1
    `

    return rows[0]
  }

  async findCandidateScopes(userId: string): Promise<WorkspaceScopeRow[]> {
    return db.$queryRaw<WorkspaceScopeRow[]>`
      SELECT
        m."organizationId" AS "organizationId",
        COALESCE(BOOL_OR(uw."isPrimary"), FALSE) AS "isPrimaryWedding",
        m."role" AS "role",
        w."id" AS "weddingId"
      FROM "member" m
      JOIN "Wedding" w ON w."organizationId" = m."organizationId"
      LEFT JOIN "UserWedding" uw
        ON uw."userId" = m."userId"
       AND uw."weddingId" = w."id"
      WHERE m."userId" = ${userId}
      GROUP BY
        m."organizationId",
        m."role",
        w."id"
      ORDER BY
        COALESCE(BOOL_OR(uw."isPrimary"), FALSE) DESC,
        MIN(m."createdAt") ASC
    `
  }

  async findWorkspaceChoices(userId: string): Promise<WorkspaceChoiceRow[]> {
    return db.$queryRaw<WorkspaceChoiceRow[]>`
      SELECT
        m."organizationId" AS "organizationId",
        COALESCE(BOOL_OR(uw."isPrimary"), FALSE) AS "isPrimaryWedding",
        m."role" AS "role",
        w."id" AS "weddingId",
        w."groomFirstName" AS "groomFirstName",
        w."groomLastName" AS "groomLastName",
        w."brideFirstName" AS "brideFirstName",
        w."brideLastName" AS "brideLastName"
      FROM "member" m
      JOIN "Wedding" w ON w."organizationId" = m."organizationId"
      LEFT JOIN "UserWedding" uw
        ON uw."userId" = m."userId"
       AND uw."weddingId" = w."id"
      WHERE m."userId" = ${userId}
      GROUP BY
        m."organizationId",
        m."role",
        w."id",
        w."groomFirstName",
        w."groomLastName",
        w."brideFirstName",
        w."brideLastName"
      ORDER BY
        COALESCE(BOOL_OR(uw."isPrimary"), FALSE) DESC,
        MIN(m."createdAt") ASC
    `
  }

  async getLastActiveOrganizationId(userId: string): Promise<string | null> {
    const rows = await db.$queryRaw<Array<{ lastActiveOrganizationId: string | null }>>`
      SELECT "lastActiveOrganizationId"
      FROM "User"
      WHERE "id" = ${userId}
      LIMIT 1
    `

    return rows[0]?.lastActiveOrganizationId ?? null
  }

  async setLastActiveOrganizationId(
    userId: string,
    organizationId: string | null
  ): Promise<void> {
    await db.$executeRaw`
      UPDATE "User"
      SET "lastActiveOrganizationId" = ${organizationId}
      WHERE "id" = ${userId}
        AND "lastActiveOrganizationId" IS DISTINCT FROM ${organizationId}
    `
  }

  async setActiveOrganizationId(
    sessionToken: string | null,
    organizationId: string | null
  ): Promise<void> {
    if (!sessionToken) {
      return
    }

    await db.$executeRaw`
      UPDATE "Session"
      SET "activeOrganizationId" = ${organizationId}
      WHERE "token" = ${sessionToken}
        AND "activeOrganizationId" IS DISTINCT FROM ${organizationId}
    `
  }
}
