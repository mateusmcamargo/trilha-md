// same values as the check on abuse_reports.category
export const ABUSE_CATEGORIES = [
    { value: 'assedio',            label: 'Assédio ou ofensa'     },
    { value: 'conteudo_improprio', label: 'Conteúdo impróprio'    },
    { value: 'perfil_falso',       label: 'Perfil falso'          },
    { value: 'outro',              label: 'Outro motivo'          },
];

export const categoryLabel = (value: string) =>
    ABUSE_CATEGORIES.find((category) => category.value === value)?.label ?? 'Outro motivo';
