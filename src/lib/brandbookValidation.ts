import type { ZodIssue } from "zod";
import { BrandbookSchemaLoose, formatZodIssues } from "@/lib/brandbookSchema";
import { migrateBrandbook } from "@/lib/brandbookMigration";
import type { BrandbookData } from "@/lib/types";

export class BrandbookValidationError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = "BrandbookValidationError";
    this.issues = issues;
  }
}

type ValidationOptions = {
  action?: string;
  subject?: string;
};

type ValidationSuccess = {
  ok: true;
  data: BrandbookData;
};

type ValidationFailure = {
  ok: false;
  error: string;
  issues: string[];
};

export type BrandbookValidationResult = ValidationSuccess | ValidationFailure;

function buildActionSuffix(action?: string): string {
  return action ? ` para ${action}` : "";
}

function formatIssueList(issues: ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.join(".") || "root";
    return `${path}: ${issue.message}`;
  });
}

export function validateLooseBrandbook(raw: unknown, options: ValidationOptions = {}): BrandbookData {
  const subject = options.subject ?? "brandbookData";
  const actionSuffix = buildActionSuffix(options.action);

  if (raw === undefined || raw === null) {
    throw new BrandbookValidationError(`${subject} é obrigatório${actionSuffix}.`);
  }

  let migrated: BrandbookData;
  try {
    migrated = migrateBrandbook(raw);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido ao migrar brandbook.";
    throw new BrandbookValidationError(`${subject} inválido${actionSuffix}.\n${message}`);
  }

  const parsed = BrandbookSchemaLoose.safeParse(migrated);
  if (!parsed.success) {
    const issues = formatIssueList(parsed.error.issues);
    const detail = formatZodIssues(parsed.error.issues, 20);
    throw new BrandbookValidationError(`${subject} inválido${actionSuffix}.\n${detail}`, issues);
  }

  return parsed.data as BrandbookData;
}

export function tryValidateLooseBrandbook(raw: unknown, options: ValidationOptions = {}): BrandbookValidationResult {
  try {
    return { ok: true, data: validateLooseBrandbook(raw, options) };
  } catch (error: unknown) {
    if (error instanceof BrandbookValidationError) {
      return {
        ok: false,
        error: error.message,
        issues: error.issues,
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao validar brandbook.",
      issues: [],
    };
  }
}
