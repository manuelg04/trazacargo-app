import { ConvexError, v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { MutationCtx, QueryCtx, mutation, query } from './_generated/server';
import {
  companyDocumentRequirementTemplateStatusValidator,
  documentDirectionValidator,
  documentTypeValidator,
} from './schema';
import { assertCompanyDocumentType, assertDriverDocumentType, assertRequiredText } from './lib/documents';
import { assertSameCompany, requireDispatcherOrAdminProfile } from './lib/permissions';

type TemplateCtx = QueryCtx | MutationCtx;
type TemplateDirection = Doc<'companyDocumentRequirementTemplates'>['direction'];
type TemplateDocumentType = Doc<'companyDocumentRequirementTemplates'>['documentType'];

const templateFields = {
  _id: v.id('companyDocumentRequirementTemplates'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  direction: documentDirectionValidator,
  documentType: documentTypeValidator,
  displayName: v.string(),
  required: v.boolean(),
  defaultDueOffsetHours: v.optional(v.number()),
  status: companyDocumentRequirementTemplateStatusValidator,
  sortOrder: v.optional(v.number()),
  createdByUserId: v.optional(v.id('users')),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const companyDocumentRequirementTemplateReturn = v.object(templateFields);

export const listForCurrentCompany = query({
  args: {},
  returns: v.array(companyDocumentRequirementTemplateReturn),
  handler: async (ctx) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const templates = await ctx.db
      .query('companyDocumentRequirementTemplates')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();

    return sortTemplates(templates);
  },
});

export const createForCurrentCompany = mutation({
  args: {
    direction: documentDirectionValidator,
    documentType: documentTypeValidator,
    displayName: v.string(),
    required: v.boolean(),
    defaultDueOffsetHours: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
  },
  returns: companyDocumentRequirementTemplateReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para la plantilla.');
    const defaultDueOffsetHours = normalizeOptionalHours(args.defaultDueOffsetHours);
    const sortOrder = normalizeOptionalSortOrder(args.sortOrder);
    assertDocumentTypeForDirection(args.direction, args.documentType);
    await assertNoActiveTemplateDuplicate(ctx, {
      companyId: profile.companyId,
      direction: args.direction,
      documentType: args.documentType,
      displayName,
    });
    const now = Date.now();
    const templateId = await ctx.db.insert('companyDocumentRequirementTemplates', {
      companyId: profile.companyId,
      direction: args.direction,
      documentType: args.documentType,
      displayName,
      required: args.required,
      defaultDueOffsetHours,
      status: 'ACTIVE',
      sortOrder,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
    const template = await ctx.db.get(templateId);

    if (!template) {
      throw new ConvexError('No se pudo crear la plantilla.');
    }

    return template;
  },
});

export const updateForCurrentCompany = mutation({
  args: {
    templateId: v.id('companyDocumentRequirementTemplates'),
    displayName: v.optional(v.string()),
    required: v.optional(v.boolean()),
    defaultDueOffsetHours: v.optional(v.union(v.number(), v.null())),
    sortOrder: v.optional(v.number()),
  },
  returns: companyDocumentRequirementTemplateReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const template = await getTemplateForCompany(ctx, args.templateId, profile.companyId);
    const displayName = args.displayName === undefined
      ? template.displayName
      : assertRequiredText(args.displayName, 'Ingresa un nombre para la plantilla.');
    const defaultDueOffsetHours = args.defaultDueOffsetHours === null
      ? undefined
      : args.defaultDueOffsetHours === undefined
      ? template.defaultDueOffsetHours
      : normalizeOptionalHours(args.defaultDueOffsetHours);
    const sortOrder = args.sortOrder === undefined ? template.sortOrder : normalizeOptionalSortOrder(args.sortOrder);

    if (template.status === 'ACTIVE') {
      await assertNoActiveTemplateDuplicate(ctx, {
        companyId: template.companyId,
        direction: template.direction,
        documentType: template.documentType,
        displayName,
        excludingTemplateId: template._id,
      });
    }

    await ctx.db.patch(template._id, {
      displayName,
      required: args.required ?? template.required,
      defaultDueOffsetHours,
      sortOrder,
      updatedAt: Date.now(),
    });
    const updatedTemplate = await ctx.db.get(template._id);

    if (!updatedTemplate) {
      throw new ConvexError('No se pudo actualizar la plantilla.');
    }

    return updatedTemplate;
  },
});

export const disableForCurrentCompany = mutation({
  args: {
    templateId: v.id('companyDocumentRequirementTemplates'),
  },
  returns: companyDocumentRequirementTemplateReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const template = await getTemplateForCompany(ctx, args.templateId, profile.companyId);

    if (template.status !== 'DISABLED') {
      await ctx.db.patch(template._id, {
        status: 'DISABLED',
        updatedAt: Date.now(),
      });
    }

    const updatedTemplate = await ctx.db.get(template._id);

    if (!updatedTemplate) {
      throw new ConvexError('No se pudo desactivar la plantilla.');
    }

    return updatedTemplate;
  },
});

export const seedDefaultsForCurrentCompany = mutation({
  args: {},
  returns: v.object({
    createdCount: v.number(),
  }),
  handler: async (ctx) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const createdCount = await ensureDefaultTemplatesForCompany(ctx, profile.companyId, userId, Date.now());

    return { createdCount };
  },
});

export async function listActiveTemplatesForCompany(ctx: TemplateCtx, companyId: Id<'companies'>) {
  const templates = await ctx.db
    .query('companyDocumentRequirementTemplates')
    .withIndex('by_company_and_status', (q) => q.eq('companyId', companyId).eq('status', 'ACTIVE'))
    .collect();

  return sortTemplates(templates);
}

export async function ensureDefaultTemplatesForCompany(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  createdByUserId: Id<'users'> | undefined,
  now = Date.now(),
) {
  const activeTemplates = await listActiveTemplatesForCompany(ctx, companyId);

  if (activeTemplates.length > 0) {
    return 0;
  }

  let createdCount = 0;

  for (const template of defaultCompanyDocumentRequirementTemplates) {
    const duplicate = await findActiveTemplateDuplicate(ctx, {
      companyId,
      direction: template.direction,
      documentType: template.documentType,
      displayName: template.displayName,
    });

    if (duplicate) {
      continue;
    }

    await ctx.db.insert('companyDocumentRequirementTemplates', {
      companyId,
      direction: template.direction,
      documentType: template.documentType,
      displayName: template.displayName,
      required: template.required,
      status: 'ACTIVE',
      sortOrder: template.sortOrder,
      createdByUserId,
      createdAt: now,
      updatedAt: now,
    });
    createdCount += 1;
  }

  return createdCount;
}

function sortTemplates(templates: Doc<'companyDocumentRequirementTemplates'>[]) {
  return templates.sort((a, b) => {
    if (a.direction !== b.direction) {
      return a.direction === 'COMPANY_TO_DRIVER' ? -1 : 1;
    }

    const aSort = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bSort = b.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (aSort !== bSort) {
      return aSort - bSort;
    }

    return a.createdAt - b.createdAt;
  });
}

async function getTemplateForCompany(
  ctx: TemplateCtx,
  templateId: Id<'companyDocumentRequirementTemplates'>,
  companyId: Id<'companies'>,
) {
  const template = await ctx.db.get(templateId);

  if (!template) {
    throw new ConvexError('La plantilla no existe.');
  }

  assertSameCompany(template.companyId, companyId);
  return template;
}

async function assertNoActiveTemplateDuplicate(
  ctx: TemplateCtx,
  input: {
    companyId: Id<'companies'>;
    direction: TemplateDirection;
    documentType: TemplateDocumentType;
    displayName: string;
    excludingTemplateId?: Id<'companyDocumentRequirementTemplates'>;
  },
) {
  const duplicate = await findActiveTemplateDuplicate(ctx, input);

  if (duplicate) {
    throw new ConvexError('Ya existe una plantilla activa con ese nombre y tipo.');
  }
}

async function findActiveTemplateDuplicate(
  ctx: TemplateCtx,
  input: {
    companyId: Id<'companies'>;
    direction: TemplateDirection;
    documentType: TemplateDocumentType;
    displayName: string;
    excludingTemplateId?: Id<'companyDocumentRequirementTemplates'>;
  },
) {
  const templates = await ctx.db
    .query('companyDocumentRequirementTemplates')
    .withIndex('by_company_direction_and_status', (q) =>
      q.eq('companyId', input.companyId).eq('direction', input.direction).eq('status', 'ACTIVE'),
    )
    .collect();
  const normalizedName = normalizeName(input.displayName);

  return templates.find(
    (template) =>
      template._id !== input.excludingTemplateId &&
      template.documentType === input.documentType &&
      normalizeName(template.displayName) === normalizedName,
  );
}

function assertDocumentTypeForDirection(direction: TemplateDirection, documentType: TemplateDocumentType) {
  if (direction === 'COMPANY_TO_DRIVER') {
    assertCompanyDocumentType(documentType);
    return;
  }

  assertDriverDocumentType(documentType);
}

function normalizeOptionalHours(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new ConvexError('Ingresa horas límite válidas.');
  }

  return value;
}

function normalizeOptionalSortOrder(value: number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value)) {
    throw new ConvexError('Ingresa un orden válido.');
  }

  return value;
}

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase();
}

export const defaultCompanyDocumentRequirementTemplates = [
  {
    direction: 'COMPANY_TO_DRIVER',
    documentType: 'MANIFEST',
    displayName: 'Manifiesto',
    required: true,
    sortOrder: 10,
  },
  {
    direction: 'COMPANY_TO_DRIVER',
    documentType: 'REMITTANCE',
    displayName: 'Remesa',
    required: true,
    sortOrder: 20,
  },
  {
    direction: 'COMPANY_TO_DRIVER',
    documentType: 'ADVANCE',
    displayName: 'Anticipo',
    required: false,
    sortOrder: 30,
  },
  {
    direction: 'DRIVER_TO_COMPANY',
    documentType: 'DELIVERY_TICKET',
    displayName: 'Ticket de descargue',
    required: true,
    sortOrder: 40,
  },
  {
    direction: 'DRIVER_TO_COMPANY',
    documentType: 'PAYMENT_ACCOUNT',
    displayName: 'Cuenta de cobro',
    required: true,
    sortOrder: 50,
  },
  {
    direction: 'DRIVER_TO_COMPANY',
    documentType: 'FULFILLMENT',
    displayName: 'Cumplido',
    required: false,
    sortOrder: 60,
  },
] satisfies {
  direction: TemplateDirection;
  documentType: TemplateDocumentType;
  displayName: string;
  required: boolean;
  sortOrder: number;
}[];
